import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { deleteAppointment, getAppointmentsByDate, updateAppointmentStatus } from '../db/database';
import { RootStackParamList } from '../types/navigation';
import { APPOINTMENT_STATUS, AppointmentWithRelations } from '../types/models';
import { formatCurrency, shiftDate, todayIsoDate } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Agenda'>;

export function AgendaScreen({ navigation }: Props) {
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);

  const load = useCallback(() => {
    setAppointments(getAppointmentsByDate(selectedDate));
  }, [selectedDate]);

  useFocusEffect(load);

  const changeStatus = (id: number, status: (typeof APPOINTMENT_STATUS)[number]) => {
    updateAppointmentStatus(id, status);
    load();
  };

  const remove = (id: number) => {
    Alert.alert('Excluir agendamento', 'Deseja realmente excluir?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteAppointment(id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <Pressable onPress={() => setSelectedDate(shiftDate(selectedDate, -1))} style={styles.navBtn}>
          <Text>{'<'}</Text>
        </Pressable>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <Pressable onPress={() => setSelectedDate(shiftDate(selectedDate, 1))} style={styles.navBtn}>
          <Text>{'>'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('AppointmentForm', { date: selectedDate })}>
        <Text style={styles.primaryBtnText}>Novo Agendamento</Text>
      </Pressable>

      <FlatList
        data={appointments}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<EmptyState message="Sem agendamentos para este dia." />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.time}>{item.startTime}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.title}>{item.clientName}</Text>
            <Text>{item.serviceName}</Text>
            <Text>{formatCurrency(item.price)}</Text>
            <View style={styles.quickActions}>
              {APPOINTMENT_STATUS.map((status) => (
                <Pressable key={status} style={styles.smallBtn} onPress={() => changeStatus(item.id, status)}>
                  <Text style={styles.smallBtnText}>{status}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.quickActions}>
              <Pressable
                style={[styles.smallBtn, styles.editBtn]}
                onPress={() => navigation.navigate('AppointmentForm', { appointmentId: item.id, date: selectedDate })}
              >
                <Text style={styles.smallBtnText}>Editar</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.deleteBtn]} onPress={() => remove(item.id)}>
                <Text style={styles.smallBtnText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  navBtn: { padding: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
  dateText: { fontSize: 18, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, marginVertical: 12 },
  primaryBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  list: { gap: 10, paddingBottom: 30 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, gap: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 20, fontWeight: '800' },
  title: { fontSize: 16, fontWeight: '700' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  smallBtn: { backgroundColor: '#374151', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  smallBtnText: { color: '#fff', fontSize: 12 },
  editBtn: { backgroundColor: '#0ea5e9' },
  deleteBtn: { backgroundColor: '#dc2626' },
});
