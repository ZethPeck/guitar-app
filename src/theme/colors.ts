// FretLogic Color Theme

export const colors = {
  // Primary colors
  background: '#1a1a2e',
  backgroundLight: '#25253d',
  surface: '#2d2d4a',
  surfaceLight: '#3d3d5c',

  // Accent colors
  primary: '#00ff88',
  primaryDim: '#00cc6e',
  secondary: '#4dabf7',
  accent: '#ffd43b',

  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#aaaacc',
  textMuted: '#666688',

  // Status colors
  success: '#00ff88',
  warning: '#ffd43b',
  error: '#ff6b6b',
  info: '#4dabf7',

  // Tuner colors
  inTune: '#00ff88',
  closeToTune: '#88ff00',
  slightlyOff: '#ffff00',
  off: '#ff8800',
  wayOff: '#ff4444',

  // Guitar string colors (optional visual distinction)
  strings: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],

  // Fretboard colors
  fretboard: '#3d2817',
  fret: '#c9a227',
  nut: '#f5f5dc',
  inlay: '#d4d4d4',
};

export type ColorName = keyof typeof colors;
