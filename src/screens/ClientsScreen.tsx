import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { deleteClient, getClients, saveClient } from '../db/database';
import { Client } from '../types/models';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Clients'>;

export function ClientsScreen({ navigation }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(() => setClients(getClients()), []);
  useFocusEffect(load);

  const openForm = (client?: Client) => {
    setEditing(client ?? null);
    setName(client?.name ?? '');
    setPhone(client?.phone ?? '');
    setNotes(client?.notes ?? '');
    setOpen(true);
  };

  const onSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Campos obrigatórios', 'Nome e telefone são obrigatórios.');
      return;
    }
    saveClient({ id: editing?.id, name: name.trim(), phone: phone.trim(), notes: notes.trim() });
    setOpen(false);
    load();
  };

  const onDelete = (id: number) => {
    Alert.alert('Excluir cliente', 'Excluir cliente e histórico de agendamentos?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteClient(id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.primaryBtn} onPress={() => openForm()}>
        <Text style={styles.primaryBtnText}>Novo Cliente</Text>
      </Pressable>

      <FlatList
        data={clients}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Nenhum cliente cadastrado." />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.phone}</Text>
            {!!item.notes && <Text>{item.notes}</Text>}
            <View style={styles.row}>
              <Pressable
                style={[styles.smallBtn, styles.infoBtn]}
                onPress={() => navigation.navigate('ClientDetail', { clientId: item.id, clientName: item.name })}
              >
                <Text style={styles.smallBtnText}>Detalhe</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.editBtn]} onPress={() => openForm(item)}>
                <Text style={styles.smallBtnText}>Editar</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.deleteBtn]} onPress={() => onDelete(item.id)}>
                <Text style={styles.smallBtnText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</Text>
            <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Telefone" style={styles.input} value={phone} onChangeText={setPhone} />
            <TextInput placeholder="Observações" style={styles.input} value={notes} onChangeText={setNotes} multiline />
            <View style={styles.row}>
              <Pressable style={[styles.smallBtn, styles.cancelBtn]} onPress={() => setOpen(false)}>
                <Text style={styles.smallBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.saveBtn]} onPress={onSave}>
                <Text style={styles.smallBtnText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  primaryBtn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 12, marginBottom: 12 },
  primaryBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  list: { gap: 8, paddingBottom: 20 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, gap: 4 },
  name: { fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  smallBtn: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  infoBtn: { backgroundColor: '#0ea5e9' },
  editBtn: { backgroundColor: '#16a34a' },
  deleteBtn: { backgroundColor: '#dc2626' },
  cancelBtn: { backgroundColor: '#6b7280' },
  saveBtn: { backgroundColor: '#2563eb' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000055', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10 },
});
