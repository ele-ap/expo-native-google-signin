// Reexport the native module wrapper. On web, `index.web.ts` is resolved instead.
import ExpoNativeGoogleSignInModule from "./ExpoNativeGoogleSignInModule";
import type { SignInOptions, SignInResult } from "./types";

export * from "./types";

/**
 * Presents the native "Sign in with Google" UI (Android Credential Manager / iOS GoogleSignIn)
 * and resolves with an ID token any backend can verify.
 *
 * NOTE(L2): this is a thin pass-through to the native module; input validation is added in L5.
 */
export async function signIn(options: SignInOptions): Promise<SignInResult> {
  return await ExpoNativeGoogleSignInModule.signIn(options);
}

/** Clears the locally cached Google credential state. */
export async function signOut(): Promise<void> {
  return await ExpoNativeGoogleSignInModule.signOut();
}
