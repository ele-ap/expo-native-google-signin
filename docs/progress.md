# Project progress

## Current phase

**`0.1.0-beta.0` published to npm on 2026-10-01 (`next` tag; npm also set `latest`, as it does on a
package's first publish).** Built against Expo SDK 57, and also validated pre-publish in a consumer app
on Expo SDK 56 (iOS simulator + Android 16 device). CI compiles the example app natively (Android,
plus iOS on Xcode 26) on every push.

**The `0.1.0` release is prepared in the PR from this branch** (versions bumped in `package.json`, both
lockfiles and `android/build.gradle`; CHANGELOG `[0.1.0]`; README status and install pins). It is not
published yet: it publishes when `v0.1.0` is tagged on `main` after the merge.

## Active plan

`docs/plans/active/2026-09-26-v0-1-0-initial-release.md` — **L1–L7 ✅ (2026-09-26); L7b (pre-publish
consumer fixes, PR ele-ap/expo-native-google-signin#2) ✅ and L8 (publish `0.1.0-beta.0`) ✅ —
2026-10-01.** The first publish was manual with 2FA: the tag-triggered `release.yml` run failed with
`E_STAGE_REQUIRED`, because a bypass-2FA token can't create a new package (see ARCHITECTURE.md →
"Engineering & release"). **L8b (OIDC-only `release.yml`) ✅ 2026-10-01.** **L9 is in progress:**
release prep is done in the PR, and the maintainer validated the published `0.1.0-beta.0` in a
real consumer app (2026-10-01). The tag and the post-publish wrap-up remain.

## Up next

1. Merge the PR with CI green. (Consumer validation of the published `0.1.0-beta.0` was reported to
   work on 2026-10-01, and its package code is identical to `0.1.0`.)
2. Tag `v0.1.0` on `main` and push. This is the first real OIDC publish; if it fails with `ENEEDAUTH`,
   check the npmjs.com Trusted Publisher fields first.
3. A follow-up docs PR: verify `latest: 0.1.0` and the provenance badge, archive the plan, and update
   progress.md and ARCHITECTURE.md.

## Completed

- **2026-10-01 — Trusted publishing (L8b):** maintainer configured npm trusted publishing and deleted
  the `NPM_TOKEN` secret and npm token; `release.yml` is now OIDC-only (no `NODE_AUTH_TOKEN`, no
  `registry-url`). **Unproven until the `0.1.0` tag runs `release.yml`.**
- **2026-10-01 — Published `0.1.0-beta.0` (L8):** manual first publish with 2FA after the CI run
  failed with `E_STAGE_REQUIRED`. The tarball has 38 files, including `build/index.web.js`.
- **2026-10-01 — Pre-publish consumer fixes (L7b), PR #2:** a pre-publish tarball was run
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
  an `NPM_TOKEN` for the first publish (token fallback removed in L8b).
- **2026-09-26 — Docs (L7):** README (requirements, Google Cloud setup with both SHA-1s, API and error
  table, Supabase nonce / Firebase / custom-server examples, migration, troubleshooting, releasing),
  CHANGELOG (`0.1.0-beta.0`, date TBD at publish), SECURITY (GitHub private vulnerability reporting).
