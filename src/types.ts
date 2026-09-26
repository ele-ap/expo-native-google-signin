/**
 * Options for {@link signIn}.
 */
export type SignInOptions = {
  /**
   * The OAuth 2.0 **web** client ID from Google Cloud Console. This becomes the `aud` claim of
   * the returned ID token on both platforms — see docs/ARCHITECTURE.md for why there is no
   * `androidClientId`.
   */
  webClientId: string;
  /**
   * The OAuth 2.0 **iOS** client ID from Google Cloud Console. Required on iOS; ignored on
   * Android.
   */
  iosClientId?: string;
  /**
   * An optional nonce forwarded to the native SDKs and embedded in the returned ID token, for
   * backends (e.g. Supabase `signInWithIdToken`) that verify it.
   */
  nonce?: string;
};

/**
 * The subset of the signed-in Google account's profile that both platforms provide.
 *
 * There is deliberately no `id`: Android's `GoogleIdTokenCredential.id` is the account's email
 * address, not the Google subject — read `sub` from the ID token instead.
 */
export type GoogleUser = {
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  photoUrl?: string;
};

/**
 * The result of {@link signIn}. A user-initiated cancel resolves with `{ type: 'cancelled' }`
 * instead of rejecting.
 */
export type SignInResult =
  | { type: "success"; idToken: string; user: GoogleUser }
  | { type: "cancelled" };

/**
 * Error codes that `signIn` and `signOut` can reject with. The native error message is always
 * preserved on the rejected error for logging.
 */
export const ERROR_CODES = [
  "CONFIGURATION_ERROR",
  "NO_GOOGLE_ACCOUNT",
  "PROVIDER_UNAVAILABLE",
  "NO_PRESENTER",
  "UNEXPECTED_CREDENTIAL",
  "SIGN_IN_FAILED",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * Narrows `error` to an `Error` with a known {@link ErrorCode}.
 */
export function isErrorWithCode(
  error: unknown,
): error is Error & { code: ErrorCode } {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (ERROR_CODES as readonly string[]).includes(
      (error as { code: string }).code,
    )
  );
}
