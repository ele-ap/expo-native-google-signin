# Architecture decisions

Permanent record of **why** structural choices were made. Newest decisions are appended at the end of
each section; superseded decisions are marked, not deleted.

## Why this project exists (2026-09-26)

- **Google is retiring the legacy Android sign-in API.** "Google Sign-In for Android"
  (`GoogleSignIn` / `GoogleSignInClient` in `com.google.android.gms:play-services-auth`) is
  deprecated in favour of **Credential Manager**. Google Play services logs a
  `You are using the deprecated legacy Google Sign-In APIs` warning whenever it runs, and
  `play-services-auth` **22.0.0 removed those classes from the SDK** (release notes dated
  2026-08-26). No date has been published for a device-side shutdown — that unannounced event is the
  real deadline, and it would break installed apps without a rebuild.
- **The widely used free wrapper stays on the legacy API.** Every free release of
  `@react-native-google-signin/google-signin` checked (13.2.0, 14.0.1, 15.0.0, 16.1.2, 16.1.5) exports
  only the legacy `GoogleSignin` module and depends only on `play-services-auth` (21.4.0 in v16);
  its README states the free version "uses the legacy Google Sign-In SDK on Android". Its Credential
  Manager implementation is part of a paid product. Because it imports the removed classes, it also
  cannot move past `play-services-auth` 21.x.
- **Other free alternatives didn't fit (as of 2026-09):** they were single-maintainer and young; one
  pinned an alpha `androidx.credentials` (`1.6.0-alpha02`), another forced `play-services-auth:22.0.0`
  plus an extra native-module runtime.
- **Decision:** a small MIT module that talks **directly to Google's first-party SDKs**, maintained in
  the open.

## Platform mechanics (2026-09-26)

- **Android = Credential Manager.** `GetSignInWithGoogleOption.Builder(serverClientId = webClientId)`
  — Google's option for an explicit "Sign in with Google" button (always shows the account chooser
  and allows adding an account) — rather than `GetGoogleIdOption`, which is for silent/auto sign-in.
  The request needs an **Activity** context. `credentials-play-services-auth` provides the
  implementation on pre-Android-14 devices and is loaded reflectively, hence the consumer ProGuard
  keep rule shipped with the module.
- **No `androidClientId` option.** Google identifies the calling Android app by **package name +
  signing-certificate SHA-1** registered on a GCP "Android" OAuth client; the ID token's audience is
  the **web** client ID passed as `serverClientId`. Consequence worth documenting loudly: apps
  distributed through Google Play are **re-signed with Google's app signing key**, so the Android
  OAuth client needs **both** the upload-key SHA-1 and the Play app-signing SHA-1 — otherwise sign-in
  fails only for Play-installed copies, often surfacing as "no credential".
- **iOS = `GoogleSignIn` SDK.** iOS has no Credential Manager, and the iOS SDK is **not** deprecated:
  `google/GoogleSignIn-iOS` shipped 9.0.0 (2025-06-26), 9.2.0 (2026-06-15) and 10.0.0 (2026-09-03)
  and is actively maintained. It runs OAuth 2.0 + PKCE through AppAuth in the system authentication
  sheet. `GIDConfiguration(clientID: iosClientId, serverClientID: webClientId)` makes the token's
  audience the web client ID, matching Android.
- **iOS pins `GoogleSignIn ~> 9.2` for v0.1.** 10.x requires Xcode 27 / iOS 15 — adopt it in a later
  minor once CI runs Xcode 27 (backlog).
- **Module naming avoids `GoogleSignIn`.** The native module is `ExpoNativeGoogleSignIn` (Swift class
  `ExpoNativeGoogleSignInModule`) because `GoogleSignIn` is the iOS SDK's Swift module name.
- **URL callback:** an `ExpoAppDelegateSubscriber` forwards `application(_:open:options:)` to
  `GIDSignIn.sharedInstance.handle(url)`.

## Public API shape (2026-09-26)

- **Two functions:** `signIn({ webClientId, iosClientId?, nonce? })` and `signOut()`, plus the config
  plugin option `iosUrlScheme`. A small surface keeps an open-source project cheap to maintain.
- **Cancel resolves `{ type: 'cancelled' }`; failures reject with coded errors**
  (`CONFIGURATION_ERROR`, `NO_GOOGLE_ACCOUNT`, `PROVIDER_UNAVAILABLE`, `NO_PRESENTER`,
  `UNEXPECTED_CREDENTIAL`, `SIGN_IN_FAILED`). The result shape mirrors
  `@react-native-google-signin/google-signin` v16 so migrating is mechanical; the native error message
  is always preserved for logging.
- **`user` exposes only fields both platforms provide** (`email`, `name`, `givenName`, `familyName`,
  `photoUrl`). There is deliberately no `id`: Android's `GoogleIdTokenCredential.id` is the email
  address, not the Google subject — read `sub` from the ID token instead.
- **`nonce` is optional pass-through** (Credential Manager `setNonce`, iOS
  `signIn(…nonce:)`), because backends such as Supabase can verify it.
- **No web implementation.** Web is better served by the auth provider's OAuth redirect; the web entry
  throws `CONFIGURATION_ERROR` with that guidance so importing the package never breaks a web bundle.

## Engineering & release (2026-09-26)

- **Native code is compiled in CI on every PR** by building the example app (Gradle on ubuntu, Xcode on
  macOS) — the only reliable proof, since local/cloud sessions may lack Google Maven or Xcode.
- **Releases are published from CI with npm provenance**; consumers are told to pin exact versions.
- **MIT license**, matching the React Native / Expo ecosystem.
