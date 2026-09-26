// Reexport the native module wrapper. On web, `index.web.ts` is resolved instead.
import { Platform } from "react-native";

import { CodedError } from "./CodedError";
import ExpoNativeGoogleSignInModule from "./ExpoNativeGoogleSignInModule";
import type { SignInOptions, SignInResult } from "./types";

export * from "./types";

const DEV_BUILD_MESSAGE =
  "expo-native-google-signin requires a development build (it is not available in Expo Go). " +
  "See README.";

function isNonBlankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates `signIn`'s options before native is ever called, so JS-side configuration mistakes
 * reject with the same `CONFIGURATION_ERROR` code (and a `CodedError`, matching the shape of
 * native errors) rather than a native crash or an unclear message. Mirrors the checks in
 * `ios/ExpoNativeGoogleSignInModule.swift` / `android/.../ExpoNativeGoogleSignInModule.kt`.
 */
function validateSignInOptions(options: SignInOptions): void {
  if (!isNonBlankString(options?.webClientId)) {
    throw new CodedError(
      "CONFIGURATION_ERROR",
      "expo-native-google-signin: `webClientId` is required (pass the OAuth web client ID -- " +
        "see docs/ARCHITECTURE.md).",
    );
  }

  if (Platform.OS === "ios" && !isNonBlankString(options.iosClientId)) {
    throw new CodedError(
      "CONFIGURATION_ERROR",
      "expo-native-google-signin: `iosClientId` is required on iOS (pass the OAuth iOS client " +
        "ID from Google Cloud Console -- Android does not need it, see docs/ARCHITECTURE.md).",
    );
  }

  if (options.nonce !== undefined && typeof options.nonce !== "string") {
    throw new CodedError(
      "CONFIGURATION_ERROR",
      "expo-native-google-signin: `nonce` must be a string when provided.",
    );
  }
}

/**
 * Returns the native module, or throws a `CONFIGURATION_ERROR` pointing at the README when it's
 * unavailable (Expo Go, or a native build that hasn't picked up this module yet).
 */
function requireNativeModule(): NonNullable<
  typeof ExpoNativeGoogleSignInModule
> {
  if (!ExpoNativeGoogleSignInModule) {
    throw new CodedError("CONFIGURATION_ERROR", DEV_BUILD_MESSAGE);
  }
  return ExpoNativeGoogleSignInModule;
}

/**
 * Presents the native "Sign in with Google" UI (Android Credential Manager / iOS GoogleSignIn)
 * and resolves with an ID token any backend can verify.
 */
export async function signIn(options: SignInOptions): Promise<SignInResult> {
  validateSignInOptions(options);
  return await requireNativeModule().signIn(options);
}

/** Clears the locally cached Google credential state. */
export async function signOut(): Promise<void> {
  return await requireNativeModule().signOut();
}
