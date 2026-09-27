# expo-native-google-signin

Native Google sign-in for Expo apps on **Android** (Credential Manager) and **iOS** (the
`GoogleSignIn` SDK). It returns a Google ID token that any backend can verify — Supabase, Firebase,
or your own server.

**Why:** "Google Sign-In for Android" (`GoogleSignInClient` in `play-services-auth`) is deprecated
in favour of Credential Manager, and `play-services-auth` 22.0.0 already removed those classes from
the SDK. This module talks only to Google's first-party SDKs — no dependency on
`@react-native-google-signin/google-signin` or any other community wrapper. MIT-licensed.

## Status and requirements

- **Pre-1.0 — not published yet.** The first release will be `0.1.0-beta.0`, on the npm `next` tag
  (see [CHANGELOG.md](./CHANGELOG.md)); the install commands below work once it is out. Per
  semver-pre-1.0, a minor bump may break the API — **pin an exact version**:

  ```sh
  npm install expo-native-google-signin@0.1.0-beta.0 --save-exact
  ```

- **Expo SDK 57.**
- **A development build** — this module is not available in **Expo Go**.
- **Android:** `minSdk` 24.
- **iOS:** 15.1+, and **Xcode 26+** (Expo SDK 57 itself requires it — `expo-modules-jsi` needs
  Swift tools 6.2).
- **`GoogleSignIn-iOS` ~> 9.2** (pinned; see `docs/ARCHITECTURE.md` for why).

## Install

```sh
npx expo install expo-native-google-signin
# or, pinned exactly:
npm install expo-native-google-signin@0.1.0-beta.0 --save-exact
```

Add the config plugin in `app.json` / `app.config.*`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-native-google-signin",
        { "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID" }
      ]
    ]
  }
}
```

Then rebuild the native projects:

```sh
npx expo prebuild
npx expo run:android
npx expo run:ios
```

(or an EAS build). `iosUrlScheme` is required for the sign-in sheet to hand control back to your
app on iOS — without it, the plugin only logs a warning.

## Google Cloud setup

Create OAuth 2.0 client IDs in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Web client** — its ID is `webClientId`. It becomes the `aud` claim of the ID token this module
   returns, on **both** platforms.
2. **iOS client** — its ID is `iosClientId`. Its reversed ID is `iosUrlScheme`
   (`com.googleusercontent.apps.…`, shown as "URL scheme" on the client's page in the console).
3. **Android client** — registered with your app's **package name** and **signing SHA-1**. There is
   no `iosClientId`-equivalent to pass at runtime for Android: Google identifies the calling app by
   package name + SHA-1 on this client, and the ID token's audience is the **web** client ID passed
   as `webClientId`. See `docs/ARCHITECTURE.md` → "Platform mechanics" for the full rationale.

> [!WARNING]
> **Play App Signing re-signs your app**, so the Android OAuth client needs **both** the
> upload-key SHA-1 **and** the Play app-signing SHA-1. If you only register the upload-key SHA-1,
> sign-in fails only for builds installed from Google Play — usually surfacing as
> `NO_GOOGLE_ACCOUNT` even though the device has one. Also register your debug keystore's and any
> EAS build profile's SHA-1s, or sign-in won't work in development builds either.

Use placeholders like `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` when configuring — never
commit a real client ID, SHA-1 or keystore (this repo is public).

## Usage

```ts
import { isErrorWithCode, signIn, signOut } from "expo-native-google-signin";

async function handleSignIn() {
  try {
    const result = await signIn({
      webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
      iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com", // required on iOS only
    });

    if (result.type === "cancelled") {
      return;
    }

    // result.type === "success"
    console.log(result.user.email, result.idToken);
    // There is no `result.user.id` -- decode `result.idToken` (a JWT) and read its `sub`
    // claim if you need the stable Google account identifier.
  } catch (error) {
    if (isErrorWithCode(error)) {
      console.warn(error.code, error.message);
    } else {
      throw error;
    }
  }
}

async function handleSignOut() {
  await signOut();
}
```

## API reference

### `signIn(options): Promise<SignInResult>`

| Option        | Type     | Required          | Notes                                                        |
| ------------- | -------- | ------------------ | -------------------------------------------------------------|
| `webClientId` | `string` | Yes (both platforms) | OAuth **web** client ID; becomes the token's `aud` claim.  |
| `iosClientId` | `string` | iOS only           | OAuth **iOS** client ID; ignored on Android.                 |
| `nonce`       | `string` | No                 | Forwarded to the native SDK and embedded in the ID token.    |

```ts
type SignInResult =
  | { type: "success"; idToken: string; user: GoogleUser }
  | { type: "cancelled" };

type GoogleUser = {
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  photoUrl?: string;
};
```

There is deliberately no `user.id`: Android's `GoogleIdTokenCredential.id` is the account's email
address, not the Google subject. Decode `idToken` and read its `sub` claim instead.

A user-initiated cancel **resolves** `{ type: "cancelled" }` — it does not reject.

### `signOut(): Promise<void>`

Clears the locally cached Google credential state on both platforms.

### `isErrorWithCode(error): error is Error & { code: ErrorCode }`

Narrows a caught `error` to one with a known `code` from `ERROR_CODES` below.

### `ERROR_CODES`

`signIn`/`signOut` reject with an `Error` whose `code` is one of these. The native error message is
always preserved on `error.message` for logging.

| Code                    | When                                                                                                                                       | Platform(s) |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------| ----------- |
| `CONFIGURATION_ERROR`   | Missing/blank `webClientId`; missing/blank `iosClientId` on iOS; an invalid `nonce` type; or the module is unavailable (e.g. running in **Expo Go** instead of a development build) | Both |
| `NO_GOOGLE_ACCOUNT`     | No Google account is available to choose from (Credential Manager's `NoCredentialException`)                                               | Android only |
| `PROVIDER_UNAVAILABLE`  | The credential provider isn't configured or supported on the device (e.g. no Play services, or an emulator without a Play Store image)     | Android only |
| `NO_PRESENTER`          | No current Activity (Android) / view controller (iOS) to present the sign-in UI from — e.g. the app was backgrounded mid-tap               | Both |
| `UNEXPECTED_CREDENTIAL` | The returned credential isn't a parseable Google ID token credential, or is missing a required field (e.g. no email/profile on iOS)         | Both |
| `SIGN_IN_FAILED`        | Any other failure. **On iOS, every non-cancel failure uses this one code** — `GoogleSignIn` has a single flat error domain that doesn't distinguish "no account" or "provider unavailable" the way Android's Credential Manager does. The native domain, code and message are always kept in `error.message`. | Both |

## Backends

### Supabase — `signInWithIdToken` with a nonce

Verifying the nonce ties the ID token to this specific sign-in attempt. Generate a raw nonce,
SHA-256-hash it, pass the **hashed** nonce into `signIn`, and pass the **raw** nonce to Supabase (it
hashes it again internally to compare against the token's `nonce` claim):

```ts
import * as Crypto from "expo-crypto";
import { signIn } from "expo-native-google-signin";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signInWithGoogle() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const result = await signIn({
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    nonce: hashedNonce,
  });

  if (result.type === "cancelled") {
    return;
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: result.idToken,
    nonce: rawNonce,
  });
}
```

(`expo-crypto` and `@supabase/supabase-js` are not dependencies of this module — install them
yourself if you use this pattern.)

### Firebase

```ts
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";

const credential = GoogleAuthProvider.credential(result.idToken);
await signInWithCredential(getAuth(), credential);
```

### A custom server

Verify, on the server: the ID token's signature (against Google's published JWKS), `aud` (must
equal your **web** client ID), `iss` (`accounts.google.com` / `https://accounts.google.com`),
`exp`, and — if you passed one to `signIn` — the (hashed) `nonce` claim.

## Migrating from `@react-native-google-signin/google-signin`

| `@react-native-google-signin/google-signin`                          | `expo-native-google-signin`                                                                 |
| ---------------------------------------------------------------------| ----------------------------------------------------------------------------------------------|
| `GoogleSignin.configure({ webClientId, iosClientId })` then `GoogleSignin.signIn()` | One call: `signIn({ webClientId, iosClientId, nonce? })` — no separate configure step |
| Result `{ type: "success" \| "cancelled", ... }`                     | Same `type` values and meaning — a cancel resolves, it doesn't throw                        |
| `user.id` (Google subject)                                           | No `id` — decode `idToken` and read its `sub` claim instead                                 |
| `androidClientId` config option                                      | Removed — not needed; Google matches by package name + SHA-1, and `webClientId` is the token audience on both platforms |
| `GoogleSignin.signOut()`                                              | `signOut()`                                                                                  |
| Config plugin option `iosUrlScheme`                                   | Same option name, same purpose                                                              |

This module exists because the free version of `@react-native-google-signin/google-signin` stays on
the legacy, deprecated Android sign-in API — its Credential Manager support is part of a paid
product (see `docs/ARCHITECTURE.md` → "Why this project exists").

## Troubleshooting

- **`NO_GOOGLE_ACCOUNT` only on builds installed from Google Play:** the Android OAuth client is
  missing the Play app-signing SHA-1 (see the warning above) — register both SHA-1s.
- **No accounts on an emulator:** use an emulator image that includes the Play Store, and sign into
  a Google account on it first.
- **`CONFIGURATION_ERROR` in Expo Go:** this module requires a development build; Expo Go can't load
  it.
- **iOS never returns to the app after choosing an account:** the config plugin's `iosUrlScheme` is
  missing or wrong — check `Info.plist`'s `CFBundleURLTypes` after `expo prebuild`.
- **iOS build fails to resolve packages / Xcode errors:** this module (via Expo SDK 57) requires
  **Xcode 26+**.

## Example app

```sh
cd example
cp .env.example .env
# fill in EXPO_PUBLIC_WEB_CLIENT_ID, EXPO_PUBLIC_IOS_CLIENT_ID, EXPO_PUBLIC_IOS_URL_SCHEME
npm install
npx expo run:android   # or: npx expo run:ios
```

## Contributing / releasing (maintainers)

See `CLAUDE.md` for the full command reference (`npm run build`, `lint`, `typecheck`, `test`,
`build:plugin`, `test:plugin`, etc.).

**Release:**

1. Bump the version in `package.json` (and `android/build.gradle`'s `version`/`versionName`, which
   is not read from `package.json`), and add a `CHANGELOG.md` entry.
2. Merge to `main`.
3. Tag `vX.Y.Z` from `main` and push the tag — `release.yml` publishes to npm with provenance
   (prereleases go to the `next` dist-tag, stable versions to `latest`), but only if the tag matches
   `package.json`'s version and the tagged commit is on `main`.

**First publish:** npm trusted publishing needs the package to already exist, so the very first
version is published manually (`npm publish --access public --tag next`), or via an `NPM_TOKEN`
repository secret.

**After that**, configure npm trusted publishing so `release.yml` doesn't need a token: on
npmjs.com, package settings → **Trusted Publisher** → GitHub Actions, repo
`ele-ap/expo-native-google-signin`, workflow `release.yml`, environment `npm`. Then delete the
`NPM_TOKEN` secret.

## Disclaimer

This project is not affiliated with or endorsed by Google.

## License

[MIT](./LICENSE)
