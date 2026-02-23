import { Text, View, StyleSheet } from 'react-native';
import { AppointmentStatus } from '../types/models';

const colors: Record<AppointmentStatus, string> = {
  MARCADO: '#2563eb',
  CONCLUIDO: '#16a34a',
  FALTOU: '#dc2626',
  CANCELADO: '#6b7280',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors[status] }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
