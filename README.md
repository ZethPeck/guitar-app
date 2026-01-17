# FretLogic

A guitar theory and practice app for Android built with React Native and Expo.

## Features

- **Tuner** - Standard guitar tuner with 7 alternate tunings (Drop D, Open G, DADGAD, etc.)
- **Pitch Detector** - Visual dial showing detected pitch with cents deviation
- **Chord Library** - Browse chords by root/type with fretboard diagrams
- **Scales & Modes** - 14 scale types plus pentatonic box shapes
- **Circle of Fifths** - Interactive music theory reference
- **Metronome** - Tap tempo, adjustable BPM, visual beat indicators
- **Chord Switch Trainer** - Practice chord changes with configurable timing

## Getting Started

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (v18 or newer)
2. Install the **Expo Go** app on your Android device:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. A QR code will appear in your terminal. On your Android device:
   - Open the **Expo Go** app
   - Tap "Scan QR code"
   - Scan the QR code from your terminal

   **Or** enter the URL manually:
   - The terminal will show something like `exp://192.168.x.x:8081`
   - In Expo Go, tap "Enter URL manually" and type it in

### Troubleshooting

- **Can't connect?** Make sure your phone and computer are on the same WiFi network
- **Still not working?** Try pressing `s` in the terminal to switch to Tunnel mode, then scan the new QR code
- **Microphone not working?** Grant microphone permission when prompted (required for tuner)

## Development

```bash
# Start with tunnel (works across networks)
npx expo start --tunnel

# Start for Android specifically
npx expo start --android

# Clear cache if having issues
npx expo start --clear
```

## Tech Stack

- React Native + Expo SDK 54
- TypeScript
- expo-router (file-based navigation)
- expo-av (audio/microphone)
- react-native-svg (visualizations)
- zustand (state management)

## License

MIT
