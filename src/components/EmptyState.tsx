import { Text, View, StyleSheet } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
  },
  text: { color: '#6b7280', textAlign: 'center' },
});
