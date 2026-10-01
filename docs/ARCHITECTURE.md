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
- **The podspec lists `GoogleUtilities` and `RecaptchaInterop` as direct dependencies (2026-09-26).**
  GoogleSignIn 9 pulls in `AppCheckCore`, which CocoaPods treats as a Swift pod (it declares a
  `swift_version`). Two of its dependencies don't define modules, so
  `pod install` fails under Expo's default static-library Podfile. The first CI iOS run hit exactly
  this. Expo autolinking enables modular headers only for the *direct* dependencies of a module pod.
  Declaring the two pods directly, without versions, fixes it with no consumer Podfile changes and no
  `useFrameworks` requirement. Re-check this list whenever the GoogleSignIn version changes.

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
- **Error detail differs by platform (2026-09-26).** Both platforms use only the shared codes, but
  Android can tell `NO_GOOGLE_ACCOUNT` and `PROVIDER_UNAVAILABLE` apart through Credential Manager's
  exception types. GoogleSignIn on iOS has one flat error domain, so every non-cancel iOS failure is
  `SIGN_IN_FAILED`, with the native domain, code and message kept. Keychain or EMM errors don't
  mean what `PROVIDER_UNAVAILABLE` means on Android, so they aren't mapped to it. `NO_PRESENTER` and
  `CONFIGURATION_ERROR` (iOS also requires `iosClientId`) are produced on both platforms.
- **No web implementation.** Web is better served by the auth provider's OAuth redirect; the web entry
  throws `CONFIGURATION_ERROR` with that guidance so importing the package never breaks a web bundle.
- **Android `[16] Account reauth failed` is a failure, not a cancel (2026-10-01).** Google Play services
  reports it as a `GetCredentialCancellationException` (usually an unregistered package + SHA-1), so
  `ErrorMapping.kt` maps a cancellation whose message contains `[16]` or "reauth failed"
  (case-insensitive, in case Play services formats the code differently) to `SIGN_IN_FAILED` with a
  hint; every other cancellation still resolves `{ type: 'cancelled' }`. No automatic retry. The message
  string is from logcat and public reports, not verified against Google's source.

## Engineering & release (2026-09-26)

- **Native code is compiled in CI on every PR** by building the example app (Gradle on ubuntu, Xcode on
  macOS) — the only reliable proof, since local/cloud sessions may lack Google Maven or Xcode.
- **`package.json` `main` is extensionless (`build/index`) (2026-10-01).** Metro resolves a `main` with an
  explicit extension literally, so with `build/index.js` the web bundle got the native entry and
  `index.web.js` was never picked. An extensionless `main` lets Metro apply platform extensions
  (`index.web.js` on web; native matches no `.ios`/`.android`/`.native` file and falls back to
  `index.js`). Node's resolution of an extensionless `main` is unaffected. Found by consumer testing.
- **Releases are published from CI with npm provenance**; consumers are told to pin exact versions.
- **MIT license**, matching the React Native / Expo ecosystem.
- **`release.yml` is locked down (2026-09-26).** Pushing a `v*` tag publishes to npm with provenance:
  prereleases go to the `next` dist-tag and stable versions to `latest`. The job only publishes when
  the tag matches the `package.json` version **and** the tagged commit is on `main`, so a tag on an
  unreviewed commit can't publish. Other safeguards:
  - It runs in the `npm` GitHub environment, so protection rules can be added.
  - It uses no npm cache and doesn't keep the checkout's git credentials.
  - npm is pinned to an exact version (≥ 11.5.1 is needed for trusted publishing; `latest` floats
    across majors).
  - No `${{ }}` expression appears inside a `run:` script, because tag names are attacker-controlled
    text.

  Auth is npm trusted publishing (OIDC) once the package exists, with an optional `NPM_TOKEN` secret
  only for the very first publish. _(Superseded 2026-10-01 for the first publish: the token fallback
  failed — see the next bullet.)_
- **The first publish was manual, with 2FA (2026-10-01).** The `NPM_TOKEN` fallback didn't work for
  it: a granular token that bypasses 2FA could only publish to a staging area, and npm refused to
  create a new package that way (`E403 … E_STAGE_REQUIRED`). In our case, publishing from a terminal
  also required 2FA enabled on the account (`E403 … Two-factor authentication … is required`). So `0.1.0-beta.0` was published by hand (no provenance), and every
  later version is intended to go through trusted publishing. Don't plan on a bypass-2FA token for publishing:
  the publish log carried npm's own notice that such tokens "are being restricted for account changes
  and direct publishing" (https://gh.io/npm-gat-bypass2fa-deprecation). Note: npm also set `latest` to `0.1.0-beta.0`, as it always does on a
  package's first publish, even with `--tag next`; `0.1.0` will move it.
- **Built against Expo SDK 57 (2026-09-26).** The module and the example app target SDK 57
  (`expo` 57, React Native 0.86), which was the current SDK when scaffolding. The draft plan said
  SDK 56, but starting on the current SDK postpones the first upgrade. Peer dependencies stay
  unpinned (`*`). Only the SDK versions that CI compiles against are claimed as supported.
- **Tooling is `expo-module-scripts` (`^56`), not the SDK 57 template's inlined scripts.** The SDK 57
  `expo-module-template` dropped `expo-module-scripts` for copied-in scripts plus `.npmignore`. We
  keep the published package, because it gives build, lint, test and publish in one maintained
  dependency. `56.0.3` is still its newest release (no 57.x exists), so `^56` is correct, not stale.
  We publish through a `files` whitelist, and `prepublishOnly` also builds `plugin/build`.
  A root `babel.config.js` (`babel-preset-expo`) is required by the Jest preset and is not published.
- **Podspec iOS minimum is 15.1**, lower than the SDK 57 template default of 16.4. It is only a floor
  (the consuming app's deployment target governs) and stays compatible with `GoogleSignIn ~> 9.2`.
  Revisit when adopting GoogleSignIn 10.x (backlog #1).
- **CI builds iOS with Xcode 26 (`macos-26`, `Xcode_26.6.app` pinned).** Expo SDK 57 requires Xcode 26:
  `expo-modules-jsi` declares `swift-tools-version: 6.2`, and its xcframework build phase fails on
  Xcode 16.4 ("Could not resolve package dependencies"). The first pin (`macos-15` / Xcode 16.4) only
  checked React Native's own minimum (16.1). `expo-modules-core` depends on `ExpoModulesJSI`, so
  this applies to every Expo SDK 57 app: consumers need Xcode 26+. The README states it (plan step L7).
  Xcode 27 stays out of CI until GoogleSignIn 10.x is adopted (backlog #1). That is a cautious
  choice: no incompatibility of GoogleSignIn 9.2 with Xcode 27 is documented.
