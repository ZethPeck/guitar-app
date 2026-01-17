import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Simple screens
function TunerScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Tuner</Text>
      <Text style={styles.subtitle}>Tap Start to begin tuning</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Start Tuner</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChordsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Chord Library</Text>
      <Text style={styles.subtitle}>Browse chords by root note</Text>
    </View>
  );
}

function ScalesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Scales & Modes</Text>
      <Text style={styles.subtitle}>Learn scale patterns</Text>
    </View>
  );
}

function CircleScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Circle of Fifths</Text>
      <Text style={styles.subtitle}>Interactive music theory</Text>
    </View>
  );
}

function PracticeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Practice</Text>
      <Text style={styles.subtitle}>Metronome & chord trainer</Text>
    </View>
  );
}

type TabName = 'tuner' | 'chords' | 'scales' | 'circle' | 'practice';

const TABS: { key: TabName; label: string }[] = [
  { key: 'tuner', label: 'Tuner' },
  { key: 'chords', label: 'Chords' },
  { key: 'scales', label: 'Scales' },
  { key: 'circle', label: 'Circle' },
  { key: 'practice', label: 'Practice' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('tuner');

  const renderScreen = () => {
    switch (activeTab) {
      case 'tuner': return <TunerScreen />;
      case 'chords': return <ChordsScreen />;
      case 'scales': return <ScalesScreen />;
      case 'circle': return <CircleScreen />;
      case 'practice': return <PracticeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FretLogic</Text>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4a',
  },
  headerTitle: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#00ff88',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2d2d4a',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    color: '#666',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
});
