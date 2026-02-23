import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { initDb } from './src/db/database';
import { AgendaScreen } from './src/screens/AgendaScreen';
import { AppointmentFormScreen } from './src/screens/AppointmentFormScreen';
import { ClientDetailScreen } from './src/screens/ClientDetailScreen';
import { ClientsScreen } from './src/screens/ClientsScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    try {
      initDb();
    } catch (error) {
      Alert.alert('Erro no banco', String(error));
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Agenda"
          component={AgendaScreen}
          options={({ navigation }) => ({
            title: 'Agenda',
            headerRight: () => (
              <>
                <Pressable onPress={() => navigation.navigate('Clients')}>
                  <Text style={{ color: '#2563eb', marginRight: 12 }}>Clientes</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Services')}>
                  <Text style={{ color: '#2563eb' }}>Serviços</Text>
                </Pressable>
              </>
            ),
          })}
        />
        <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Novo/Editar Agendamento' }} />
        <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Clientes' }} />
        <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detalhe do Cliente' }} />
        <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'Serviços' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
