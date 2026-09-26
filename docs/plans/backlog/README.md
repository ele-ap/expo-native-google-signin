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

- **Why:** `ci.yml` pins `macos-15` + `Xcode_16.4.app` to stay on Xcode 16/26 while GoogleSignIn is
  pinned to 9.2 (10.x needs Xcode 27). GitHub will eventually deprecate the `macos-15` image.
- **Action:** when moving runners, check the new image's default Xcode against React Native's
  `min_xcode_version_supported` (16.1 for RN 0.86, in `react-native/scripts/cocoapods/helpers.rb`).
  Do it together with backlog #1 if possible.
