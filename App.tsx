import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TunerScreen, ChordsScreen, ScalesScreen, CircleScreen, PracticeScreen } from './src/screens';

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
        <Text style={styles.headerSubtitle}>
          {TABS.find(t => t.key === activeTab)?.label}
        </Text>
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4a',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
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
