# Backlog

A living list of deferred fixes and enhancements that are **not covered by the active plan** and don't
yet justify a dedicated plan. Each item records what/why/where so it can be picked up later. When an
item is scheduled, move it into a real plan under `docs/plans/active/`.

> Convention: this folder holds **discovered work that has no home in the active plan**. It is not a
> substitute for the active-plan workflow — items here still go through `/plan → /implement → /review`
> when picked up.

---

## Open items

### 1. Support GoogleSignIn-iOS 10.x

- **Why:** 10.0.0 shipped 2026-09-03 (AppAuth 3, GTMAppAuth 6). v0.1 pins `~> 9.2` because 10.x
  requires **Xcode 27** and raises the iOS minimum to 15.0.
- **Action:** once the CI macOS image runs Xcode 27, widen the podspec range, run the example compile
  and a device test, release as a minor.

### 2. Silent / automatic sign-in (`GetGoogleIdOption`)

- **Why:** v0.1 only exposes the explicit-button flow (`GetSignInWithGoogleOption`). Returning-user
  auto sign-in (`filterByAuthorizedAccounts`, `autoSelectEnabled`) and the iOS
  `restorePreviousSignIn` equivalent are common requests.
- **Action:** design a single cross-platform `signInSilently()` with the same result/error shape;
  needs an ARCHITECTURE.md entry (new API surface).

### 3. Authorization / extra OAuth scopes

- **Why:** v0.1 does authentication only (ID token). Access tokens for Google APIs need
  `AuthorizationClient` on Android and `addScopes` on iOS.
- **Action:** only if there is real demand — it roughly doubles the surface.

### 4. Web support

- **Why:** v0.1 ships a throwing web stub; most web apps use their auth provider's OAuth redirect.
- **Action:** evaluate Google Identity Services for web if users ask; otherwise keep the stub.

### 5. Branded "Sign in with Google" button

- **Why:** apps must follow Google's branding guidelines; v0.1 ships no UI.
- **Action:** optional; would need care around Google's branding rules. Low priority.

### 6. CI macOS runner / Xcode pin

- **Why:** `ci.yml` pins `macos-26` + `Xcode_26.6.app`. Expo SDK 57 needs Xcode 26+, and
  Xcode 27 is kept out until GoogleSignIn 10.x (which requires it) is adopted. Runner images change their default and
  installed Xcode versions over time, so the pinned app path can disappear.
- **Action:** when moving runners, check the new image's default Xcode against React Native's
  `min_xcode_version_supported` (16.1 for RN 0.86, in `react-native/scripts/cocoapods/helpers.rb`)
  **and** Expo's Swift tools version (6.2 → Xcode 26, in `expo-modules-jsi/apple/Package.swift`).
  Do it together with backlog #1 if possible.

### 7. Cancel an in-flight Android sign-in

- **Why:** `signIn`/`signOut` create a `CancellationSignal` per call but never keep or cancel it, so a
  sign-in started just before the Activity is destroyed runs to completion. This is harmless in v0.1.
- **Action:** if needed, keep the signal and cancel it on Activity destroy (Expo `OnActivityDestroys`),
  resolving `{ type: 'cancelled' }`.

### 8. Swift unit test for `ErrorMapping.swift`

- **Why:** Android's error mapping has a JVM unit test that CI runs (`ErrorMappingTest.kt`). The iOS
  equivalent (`classifySignInError` in `ios/ErrorMapping.swift`) has none, because the module has no
  XCTest target yet.
- **Action:** add a podspec `test_spec` (or a small SwiftPM test target) that CI runs on `macos-26`,
  covering cancel → cancelled, other errors → `SIGN_IN_FAILED`, and message preservation.

### 9. Derive the Android Gradle version from `package.json`

- **Why:** `android/build.gradle` hardcodes `version` / `versionName` (`0.1.0-beta.0`), while the iOS
  podspec reads `package.json`. For now the README's release steps list the Gradle bump as manual.
- **Action:** read the version from `../package.json` in `build.gradle` (as other Expo modules do) and
  drop the manual step.
