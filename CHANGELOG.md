# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project is
pre-1.0, so — per [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — a minor version bump
may break the API; see `CLAUDE.md` → "Conventions".

## [Unreleased]

## [0.1.0-beta.0] - 2026-10-01

First publish, manual (no npm provenance); later versions are published from CI with provenance.

### Added

- `signIn({ webClientId, iosClientId?, nonce? })` — native "Sign in with Google" using Android
  Credential Manager (`GetSignInWithGoogleOption`) and the iOS `GoogleSignIn` SDK, returning a
  Google ID token plus the subset of profile fields both platforms provide (`email`, `name`,
  `givenName`, `familyName`, `photoUrl`).
- `signOut()` — clears the locally cached credential state on both platforms.
- `isErrorWithCode` and the shared `ERROR_CODES` (`CONFIGURATION_ERROR`, `NO_GOOGLE_ACCOUNT`,
  `PROVIDER_UNAVAILABLE`, `NO_PRESENTER`, `UNEXPECTED_CREDENTIAL`, `SIGN_IN_FAILED`). A
  user-initiated cancel resolves `{ type: "cancelled" }` instead of rejecting; on Android,
  `[16] Account reauth failed` (an unregistered package + signing SHA-1) rejects with
  `SIGN_IN_FAILED` rather than resolving as cancelled.
- Config plugin option `iosUrlScheme`, appended to `Info.plist`'s `CFBundleURLTypes` for the OAuth
  redirect back into the app.
- A web stub entry point that throws `CONFIGURATION_ERROR` — there is no web implementation, by
  design (picked up under Metro via an extensionless `main`).

### Platform requirements

- Expo SDK 57; a development build (not available in Expo Go).
- Android `minSdk` 24; `androidx.credentials` 1.6.0 + `googleid` 1.2.0.
- iOS 15.1+; `GoogleSignIn-iOS` ~> 9.2; Xcode 26+ (required by Expo SDK 57 itself).

[Unreleased]: https://github.com/ele-ap/expo-native-google-signin/compare/v0.1.0-beta.0...HEAD
[0.1.0-beta.0]: https://github.com/ele-ap/expo-native-google-signin/releases/tag/v0.1.0-beta.0
