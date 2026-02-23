import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { getAppointmentsByClient, getClients } from '../db/database';
import { AppointmentWithRelations, Client } from '../types/models';
import { RootStackParamList } from '../types/navigation';
import { formatCurrency } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientDetail'>;

export function ClientDetailScreen({ route }: Props) {
  const { clientId } = route.params;
  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<AppointmentWithRelations[]>([]);

  const load = useCallback(() => {
    setClient(getClients().find((row) => row.id === clientId) ?? null);
    setHistory(getAppointmentsByClient(clientId));
  }, [clientId]);

  useFocusEffect(load);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.name}>{client?.name}</Text>
        <Text>{client?.phone}</Text>
        {!!client?.notes && <Text>{client.notes}</Text>}
      </View>
      <Text style={styles.title}>Histórico de Agendamentos</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Este cliente ainda não possui agendamentos." />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>
              {item.date} às {item.startTime}
            </Text>
            <Text>{item.serviceName}</Text>
            <Text>{formatCurrency(item.price)}</Text>
            <StatusBadge status={item.status} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  box: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, gap: 4 },
  name: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  list: { gap: 8, paddingBottom: 20 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, gap: 4 },
  itemTitle: { fontWeight: '700' },
});
