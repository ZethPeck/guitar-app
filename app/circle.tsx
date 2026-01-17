import { View, Text, StyleSheet } from 'react-native';

export default function CircleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Circle of Fifths</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#00ff88',
    fontSize: 24,
  },
});
