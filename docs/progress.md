# Project progress

## Current phase

**v0.1.0 in preparation — module scaffolded (Expo SDK 57).** Build, lint, typecheck and Jest work
locally, and CI compiles the example app natively (Android, plus iOS on Xcode 26). Native
`signIn`/`signOut` are implemented on **Android** (Credential Manager) and **iOS** (GoogleSignIn). JS
validation, the config plugin's URL scheme and the example app UI come in L5.

## Active plan

`docs/plans/active/2026-09-26-v0-1-0-initial-release.md` — **L1 ✅, L2 (scaffold) ✅, L2b (CI native
compiles, pulled forward) ✅, L3 (Android) ✅, L4 (iOS) ✅ — 2026-09-26.** Work happens on draft PR ele-ap/expo-native-google-signin#1,
where CI compiles Android and iOS on every push. Next step: **L5 — JS wrapper validation, web stub,
config plugin** (`iosUrlScheme` → `CFBundleURLTypes`) and the example app's sign-in UI.

## Up next

1. L5 JS wrapper / web stub
   / config plugin → L6 remaining tests + `release.yml` → L7 docs.
2. L8 publish `0.1.0-beta.0` (`next` tag) — **needs the maintainer's npm account** (first publish is
   manual or via an `NPM_TOKEN` secret; trusted publishing is configured after the package exists).
3. L9 validate in a real consumer app on both platforms → publish `0.1.0` (`latest`).

## Completed

- **2026-09-26 — Bootstrap (L1):** public repo `ele-ap/expo-native-google-signin` (MIT), AI-development docs, subagents and commands.
- **2026-09-26 — Scaffold (L2):** Expo module on SDK 57 (`expo-module-scripts` tooling), JS types and
  web stub, config-plugin skeleton, Android/iOS stubs with the Google dependencies declared, example
  app wired to `EXPO_PUBLIC_*` env vars; real Commands section in CLAUDE.md.
- **2026-09-26 — CI native compiles (L2b):** `ci.yml` (JS; Android `assembleDebug`; iOS `macos-26` /
  Xcode 26.6 simulator build), green on draft PR #1. The first runs found three native issues (Kotlin
  `Nothing` stubs, AppCheckCore modular headers, Expo SDK 57 needing Xcode 26), fixed and documented.
- **2026-09-26 — Android (L3):** Credential Manager `GetSignInWithGoogleOption` sign-in (nonce
  pass-through, cancel resolves `{ type: 'cancelled' }`), `clearCredentialState` sign-out, pure
  `ErrorMapping.kt` with a JVM unit test run in CI.
- **2026-09-26 — iOS (L4):** GoogleSignIn 9.2 sign-in (iOS + web client IDs, nonce, cancel resolves),
  sign-out, `ErrorMapping.swift`. Same result shape and codes as Android; non-cancel iOS errors are
  `SIGN_IN_FAILED` (see ARCHITECTURE.md).
