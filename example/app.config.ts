import type { ExpoConfig } from 'expo/config';

// Set in `.env` (copy `.env.example`); never commit real values.
const iosUrlScheme = process.env.EXPO_PUBLIC_IOS_URL_SCHEME;

const config: ExpoConfig = {
  name: 'expo-native-google-signin-example',
  slug: 'expo-native-google-signin-example',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'expo.modules.nativegooglesignin.example',
    supportsTablet: true,
  },
  android: {
    package: 'expo.modules.nativegooglesignin.example',
  },
  // The config plugin option is only set when an iOS URL scheme is configured, so `expo config`
  // and prebuild work out of the box before a consumer sets up Google OAuth credentials.
  plugins: [iosUrlScheme ? ['../app.plugin.js', { iosUrlScheme }] : '../app.plugin.js'],
};

export default config;
