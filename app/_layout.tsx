import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#1a1a2e' },
          tabBarActiveTintColor: '#00ff88',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Tuner' }} />
        <Tabs.Screen name="chords" options={{ title: 'Chords' }} />
        <Tabs.Screen name="scales" options={{ title: 'Scales' }} />
        <Tabs.Screen name="circle" options={{ title: 'Circle' }} />
        <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      </Tabs>
    </>
  );
}
