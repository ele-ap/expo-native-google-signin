# Project progress

## Current phase

**v0.1.0 in preparation — feature-complete on draft PR #1 (Expo SDK 57).** Build, lint, typecheck and Jest work
locally, and CI compiles the example app natively (Android, plus iOS on Xcode 26). The full
v0.1 API works end to end: `signIn`/`signOut` on **Android** (Credential Manager) and **iOS**
(GoogleSignIn), JS validation, the Expo Go error, the `iosUrlScheme` config plugin and an example
sign-in screen. What's left: publishing (L8) and device validation (L9), both with the maintainer.

## Active plan

`docs/plans/active/2026-09-26-v0-1-0-initial-release.md` — **L1 ✅, L2 (scaffold) ✅, L2b (CI native
compiles, pulled forward) ✅, L3 (Android) ✅, L4 (iOS) ✅, L5 (JS + plugin) ✅, L6 (`release.yml`) ✅, L7 (docs) ✅ — 2026-09-26; L7b (pre-publish consumer fixes: Android `[16]` → `SIGN_IN_FAILED`, extensionless `main` so the web stub is used under Metro) implemented 2026-10-01, pending CI + merge.** Work happens on draft PR ele-ap/expo-native-google-signin#1,
where CI compiles Android and iOS on every push. All code and docs for v0.1.0 are done, apart from the L7b fixes awaiting CI and merge. Next step: **L8 — publish
`0.1.0-beta.0`**, which needs the maintainer: merge PR #1 to `main`, add the CHANGELOG date, then do the
first publish (manual, or an `NPM_TOKEN` secret + tag `v0.1.0-beta.0`). See README → Contributing /
releasing.

## Up next

1. L8 publish `0.1.0-beta.0` (`next` tag) — **needs the maintainer's npm account** (first publish is
   manual or via an `NPM_TOKEN` secret; trusted publishing is configured after the package exists).
2. L9 validate in a real consumer app on both platforms → publish `0.1.0` (`latest`).

## Completed

- **2026-10-01 — Pre-publish consumer fixes (L7b), pending CI + merge:** a pre-publish tarball was run
  in a consumer app (Expo SDK 56, iOS simulator + Android 16 device). Fixed Android `[16] Account reauth
  failed` resolving as cancelled (now `SIGN_IN_FAILED` with a hint) and `main` → `build/index` so Metro
  picks `index.web.js` on web.

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
- **2026-09-26 — JS + config plugin (L5):** validation before native (`CONFIGURATION_ERROR`), a clear
  "requires a development build" error in Expo Go, a shared internal `CodedError` (no undeclared
  `expo-modules-core` import), the `iosUrlScheme` plugin (validated, added once), the example sign-in
  screen, and 32 Jest + 8 plugin tests run in CI.
- **2026-09-26 — Release workflow (L6):** `release.yml`. A `v*` tag publishes to npm with provenance
  (prereleases → `next`), after the tag/version and tag-on-`main` checks and the JS checks. It runs
  in the `npm` environment, uses no cache, and pins npm 11.20.0. Auth is trusted publishing (OIDC), or
  an `NPM_TOKEN` for the first publish.
- **2026-09-26 — Docs (L7):** README (requirements, Google Cloud setup with both SHA-1s, API and error
  table, Supabase nonce / Firebase / custom-server examples, migration, troubleshooting, releasing),
  CHANGELOG (`0.1.0-beta.0`, date TBD at publish), SECURITY (GitHub private vulnerability reporting).
