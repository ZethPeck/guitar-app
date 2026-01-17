import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { colors } from '../src/theme/colors';

// Custom icon components
function TunerIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="12" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

function ChordIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
      <Circle cx="8" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="8" r="2" fill={color} />
      <Circle cx="16" cy="14" r="2" fill={color} />
    </Svg>
  );
}

function ScaleIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth="2" />
      <Line x1="4" y1="4" x2="4" y2="20" stroke={color} strokeWidth="2" />
      <Path d="M4 16 L8 12 L12 14 L16 8 L20 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CircleIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="4" r="2" fill={color} />
      <Circle cx="19" cy="8" r="2" fill={color} />
      <Circle cx="19" cy="16" r="2" fill={color} />
      <Circle cx="12" cy="20" r="2" fill={color} />
      <Circle cx="5" cy="16" r="2" fill={color} />
      <Circle cx="5" cy="8" r="2" fill={color} />
    </Svg>
  );
}

function MetronomeIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 22 L12 2 L18 22 Z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <Line x1="8" y1="16" x2="16" y2="16" stroke={color} strokeWidth="2" />
      <Line x1="12" y1="16" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Tabs
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: colors.surface,
              borderTopWidth: 1,
              paddingTop: 5,
              paddingBottom: 5,
              height: 60,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 10,
              marginTop: 2,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Tuner',
              headerTitle: 'FretLogic Tuner',
              tabBarIcon: ({ color, size }) => <TunerIcon color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="chords"
            options={{
              title: 'Chords',
              headerTitle: 'Chord Library',
              tabBarIcon: ({ color, size }) => <ChordIcon color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="scales"
            options={{
              title: 'Scales',
              headerTitle: 'Scales & Modes',
              tabBarIcon: ({ color, size }) => <ScaleIcon color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="circle"
            options={{
              title: 'Circle',
              headerTitle: 'Circle of Fifths',
              tabBarIcon: ({ color, size }) => <CircleIcon color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="practice"
            options={{
              title: 'Practice',
              headerTitle: 'Practice Tools',
              tabBarIcon: ({ color, size }) => <MetronomeIcon color={color} size={size} />,
            }}
          />
        </Tabs>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
