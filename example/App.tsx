import { isErrorWithCode, signIn, signOut } from 'expo-native-google-signin';
import type { GoogleUser } from 'expo-native-google-signin';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;

// `iosClientId` is only required on iOS -- see docs/ARCHITECTURE.md.
const isMissingRequiredEnv = !webClientId || (Platform.OS === 'ios' && !iosClientId);

// Never log or display a full ID token -- only a short, unusable prefix, enough to confirm one
// was returned.
const ID_TOKEN_PREVIEW_LENGTH = 12;

type Status =
  | { type: 'idle' }
  | { type: 'success'; user: GoogleUser; idTokenPreview: string }
  | { type: 'cancelled' }
  | { type: 'error'; code: string; message: string };

/** Turns a `signIn`/`signOut` rejection into an `{ type: 'error' }` status. */
function toErrorStatus(error: unknown): Status {
  if (isErrorWithCode(error)) {
    return { type: 'error', code: error.code, message: error.message };
  }
  return {
    type: 'error',
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : String(error),
  };
}

export default function App() {
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  const handleSignIn = async () => {
    try {
      const result = await signIn({ webClientId: webClientId!, iosClientId });
      if (result.type === 'cancelled') {
        setStatus({ type: 'cancelled' });
        return;
      }
      setStatus({
        type: 'success',
        user: result.user,
        idTokenPreview: `${result.idToken.slice(0, ID_TOKEN_PREVIEW_LENGTH)}…`,
      });
    } catch (error) {
      setStatus(toErrorStatus(error));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setStatus({ type: 'idle' });
    } catch (error) {
      setStatus(toErrorStatus(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>expo-native-google-signin example</Text>

      {isMissingRequiredEnv ? (
        <Text style={styles.body}>
          Missing `EXPO_PUBLIC_WEB_CLIENT_ID`
          {Platform.OS === 'ios' ? ' or `EXPO_PUBLIC_IOS_CLIENT_ID`' : ''}. Copy `.env.example` to
          `.env`, fill in your own Google Cloud OAuth client IDs, and restart Expo.
        </Text>
      ) : (
        <>
          <Button title="Continue with Google" onPress={handleSignIn} />
          <View style={styles.spacer} />
          <Button title="Sign out" onPress={handleSignOut} />

          <View style={styles.spacer} />
          {status.type === 'success' && (
            <View>
              <Text style={styles.body}>Signed in as {status.user.email}</Text>
              <Text style={styles.body}>ID token: {status.idTokenPreview}</Text>
            </View>
          )}
          {status.type === 'cancelled' && <Text style={styles.body}>Cancelled</Text>}
          {status.type === 'error' && (
            <Text style={styles.body}>
              {status.code}: {status.message}
            </Text>
          )}
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
    marginTop: 8,
  },
  spacer: {
    height: 12,
  },
});
