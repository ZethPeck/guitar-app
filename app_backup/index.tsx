import { View, Text, StyleSheet } from 'react-native';

export default function TunerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FretLogic Tuner</Text>
      <Text style={styles.subtext}>App is loading correctly!</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
});
