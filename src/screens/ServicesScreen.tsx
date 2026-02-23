import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { deleteService, getServices, saveService } from '../db/database';
import { Service } from '../types/models';
import { formatCurrency } from '../utils/date';

export function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [durationMin, setDurationMin] = useState('60');
  const [defaultPrice, setDefaultPrice] = useState('0');

  const load = useCallback(() => setServices(getServices()), []);
  useFocusEffect(load);

  const openForm = (service?: Service) => {
    setEditing(service ?? null);
    setName(service?.name ?? '');
    setDurationMin(String(service?.durationMin ?? 60));
    setDefaultPrice(String(service?.defaultPrice ?? 0));
    setOpen(true);
  };

  const onSave = () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do serviço.');
      return;
    }

    saveService({
      id: editing?.id,
      name: name.trim(),
      durationMin: Number(durationMin),
      defaultPrice: Number(defaultPrice),
    });
    setOpen(false);
    load();
  };

  const onDelete = (id: number) => {
    Alert.alert('Excluir serviço', 'Deseja excluir este serviço?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteService(id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.primaryBtn} onPress={() => openForm()}>
        <Text style={styles.primaryBtnText}>Novo Serviço</Text>
      </Pressable>

      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Nenhum serviço cadastrado." />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Duração: {item.durationMin} min</Text>
            <Text>Preço padrão: {formatCurrency(item.defaultPrice)}</Text>
            <View style={styles.row}>
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
            <Text style={styles.modalTitle}>{editing ? 'Editar Serviço' : 'Novo Serviço'}</Text>
            <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={setName} />
            <TextInput
              placeholder="Duração em minutos"
              style={styles.input}
              value={durationMin}
              onChangeText={setDurationMin}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Preço padrão"
              style={styles.input}
              value={defaultPrice}
              onChangeText={setDefaultPrice}
              keyboardType="numeric"
            />
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
  editBtn: { backgroundColor: '#16a34a' },
  deleteBtn: { backgroundColor: '#dc2626' },
  cancelBtn: { backgroundColor: '#6b7280' },
  saveBtn: { backgroundColor: '#2563eb' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000055', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10 },
});
