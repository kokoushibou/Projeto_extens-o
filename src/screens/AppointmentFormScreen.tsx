import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getAppointmentById, getClients, getServices, hasTimeConflict, saveAppointment } from '../db/database';
import { APPOINTMENT_STATUS, AppointmentStatus, Client, Service } from '../types/models';
import { RootStackParamList } from '../types/navigation';
import { todayIsoDate } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentForm'>;

export function AppointmentFormScreen({ navigation, route }: Props) {
  const editingId = route.params?.appointmentId;
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [date, setDate] = useState(route.params?.date ?? todayIsoDate());
  const [startTime, setStartTime] = useState('09:00');
  const [durationMin, setDurationMin] = useState('60');
  const [clientId, setClientId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [price, setPrice] = useState('0');
  const [status, setStatus] = useState<AppointmentStatus>('MARCADO');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const clientRows = getClients();
    const serviceRows = getServices();
    setClients(clientRows);
    setServices(serviceRows);

    if (!editingId) {
      setClientId(clientRows[0]?.id ?? null);
      const defaultService = serviceRows[0];
      setServiceId(defaultService?.id ?? null);
      if (defaultService) {
        setDurationMin(String(defaultService.durationMin));
        setPrice(String(defaultService.defaultPrice));
      }
      return;
    }

    const appt = getAppointmentById(editingId);
    if (appt) {
      setDate(appt.date);
      setStartTime(appt.startTime);
      setDurationMin(String(appt.durationMin));
      setClientId(appt.clientId);
      setServiceId(appt.serviceId);
      setPrice(String(appt.price));
      setStatus(appt.status);
      setNotes(appt.notes ?? '');
    }
  }, [editingId]);

  const onServiceChange = (id: number) => {
    setServiceId(id);
    const svc = services.find((s) => s.id === id);
    if (svc) {
      setDurationMin(String(svc.durationMin));
      setPrice(String(svc.defaultPrice));
    }
  };

  const persist = () => {
    if (!clientId || !serviceId) {
      Alert.alert('Campos obrigatórios', 'Selecione cliente e serviço.');
      return;
    }

    const doSave = () => {
      saveAppointment({
        id: editingId,
        date,
        startTime,
        durationMin: Number(durationMin),
        clientId,
        serviceId,
        price: Number(price),
        status,
        notes,
      });
      navigation.goBack();
    };

    if (hasTimeConflict(date, startTime, editingId)) {
      Alert.alert('Conflito de horário', 'Já existe agendamento na mesma data e hora. Salvar mesmo assim?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salvar', onPress: doSave },
      ]);
      return;
    }

    doSave();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} />

      <Text style={styles.label}>Hora início (HH:MM)</Text>
      <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} />

      <Text style={styles.label}>Cliente</Text>
      <View style={styles.options}>
        {clients.map((client) => (
          <Pressable
            key={client.id}
            style={[styles.optionBtn, client.id === clientId && styles.optionBtnActive]}
            onPress={() => setClientId(client.id)}
          >
            <Text style={styles.optionText}>{client.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Serviço</Text>
      <View style={styles.options}>
        {services.map((service) => (
          <Pressable
            key={service.id}
            style={[styles.optionBtn, service.id === serviceId && styles.optionBtnActive]}
            onPress={() => onServiceChange(service.id)}
          >
            <Text style={styles.optionText}>{service.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Duração (min)</Text>
      <TextInput style={styles.input} value={durationMin} onChangeText={setDurationMin} keyboardType="numeric" />

      <Text style={styles.label}>Preço</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Text style={styles.label}>Status</Text>
      <View style={styles.options}>
        {APPOINTMENT_STATUS.map((item) => (
          <Pressable key={item} style={[styles.optionBtn, item === status && styles.optionBtnActive]} onPress={() => setStatus(item)}>
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Observações</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline />

      <Pressable style={styles.saveBtn} onPress={persist}>
        <Text style={styles.saveBtnText}>Salvar Agendamento</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  label: { fontWeight: '700', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  optionBtnActive: { backgroundColor: '#bfdbfe', borderColor: '#2563eb' },
  optionText: { fontSize: 12 },
  saveBtn: { marginTop: 10, backgroundColor: '#2563eb', padding: 12, borderRadius: 10 },
  saveBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
