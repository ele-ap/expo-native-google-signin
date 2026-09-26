import type { ErrorCode, SignInOptions, SignInResult } from "./types";

export * from "./types";

const MESSAGE =
  "expo-native-google-signin has no web implementation. Use your auth provider's OAuth " +
  "redirect flow on web instead (see the README).";

function unsupported(): never {
  const error = new Error(MESSAGE) as Error & { code: ErrorCode };
  error.code = "CONFIGURATION_ERROR";
  throw error;
}

/** Always throws a `CONFIGURATION_ERROR` — there is no web implementation, by design. */
export async function signIn(_options: SignInOptions): Promise<SignInResult> {
  return unsupported();
}

/** Always throws a `CONFIGURATION_ERROR` — there is no web implementation, by design. */
export async function signOut(): Promise<void> {
  return unsupported();
}
