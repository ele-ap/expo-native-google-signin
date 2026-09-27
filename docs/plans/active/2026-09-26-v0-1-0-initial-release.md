# expo-native-google-signin v0.1.0 — initial release

**Created:** 2026-09-26
**Status:** approved 2026-09-26 — L1 (bootstrap) and L2 (scaffold, SDK 57) done; L2b (CI pulled forward), L3 (Android), L4 (iOS), L5 (JS + plugin), L6 (`release.yml`) and L7 (docs) done; next L8 (publish — maintainer)

## Objective

A small, open-source Expo module for **native Google sign-in on Android and iOS**, built only on
Google's first-party SDKs:
- **Android:** Credential Manager (`androidx.credentials` + `googleid`), replacing the deprecated
  `play-services-auth` `GoogleSignInClient`
- **iOS:** the `GoogleSignIn` SDK

It returns a Google ID token for any backend (Supabase, Firebase, custom). Free and MIT-licensed, with
no dependency on `@react-native-google-signin/google-signin`.

## Founding decisions (seed `docs/ARCHITECTURE.md`)

- **First-party SDKs only.** Legacy `play-services-auth` sign-in is deprecated, and removed from the
  SDK in 22.0.0. The free community lib stays on it; its Credential Manager version is paid.
- **Minimal surface:** `signIn`, `signOut`, and one config-plugin option. Small scope keeps
  maintenance cheap.
- **A cancel resolves `{ type: 'cancelled' }` instead of throwing.** That's the same shape as
  `@react-native-google-signin` v16, so migrating is easy.
- **No `androidClientId`.** Google matches Android apps by package + SHA-1; `serverClientId` = the web
  client ID on both platforms, so the token's `aud` is the web client.
- **iOS pins `GoogleSignIn ~> 9.2` in v0.1.** 10.x needs Xcode 27 and comes in a later minor once CI
  runs it.
- **No web implementation.** Web builds get a stub that throws a clear error; use the auth provider's
  OAuth redirect instead.
- **Native code is compiled in CI on every PR** (ubuntu Gradle + macOS Xcode) through the example app.

## Files to create (after bootstrap)

Standard non-local Expo module layout from `expo-module-template` (SDK 57), with the view, events and
tvOS parts stripped:

- **`package.json`:**
  - `name: expo-native-google-signin`, `version: 0.1.0-beta.0`, `license: MIT`, `repository`
  - a `files` whitelist (`build`, `plugin/build`, `ios`, `android`, `app.plugin.js`,
    `expo-module.config.json`)
  - peer deps `expo`, `react`, `react-native`
  - `expo-module-scripts` for build, lint and test
- **`expo-module.config.json`:**
  - platforms `apple` + `android`
  - apple module `ExpoNativeGoogleSignInModule` and
    `appDelegateSubscribers: ["ExpoNativeGoogleSignInAppDelegateSubscriber"]`
  - android module `expo.modules.nativegooglesignin.ExpoNativeGoogleSignInModule`
  - JS name `ExpoNativeGoogleSignIn`. That avoids `GoogleSignIn`, which collides with the iOS SDK's
    Swift module.
- **`src/index.ts`** (typed wrapper, validates before native), **`src/index.web.ts`** (stub),
  **`src/types.ts`**.
- **`plugin/src/index.ts`** → **`app.plugin.js`:** validates `iosUrlScheme`
  (`com.googleusercontent.apps.` prefix) and appends it once to `CFBundleURLTypes` via
  `IOSConfig.Scheme.appendScheme`. It's a no-op on Android, with the same option as the community
  lib's plugin.
- **`android/build.gradle`:** `androidx.credentials:credentials:1.6.0`,
  `credentials-play-services-auth:1.6.0`, `googleid:1.2.0` (fall back to the latest stable if CI
  rejects them), plus `consumerProguardFiles 'consumer-rules.pro'`.
- **`android/consumer-rules.pro`:** Google's documented keep rule for
  `androidx.credentials.playservices.**`.
- **`android/src/main/java/expo/modules/nativegooglesignin/ExpoNativeGoogleSignInModule.kt`**, plus a
  pure `ErrorMapping.kt`.
- **`ios/ExpoNativeGoogleSignIn.podspec`:** `:ios => '15.1'`, `s.dependency 'GoogleSignIn', '~> 9.2'`.
- **`ios/ExpoNativeGoogleSignInModule.swift`** and **`ios/ExpoNativeGoogleSignInAppDelegateSubscriber.swift`**.
- **`example/`:** Continue with Google → shows the email + token prefix; Sign out. Client IDs come
  from `EXPO_PUBLIC_*` env and are never committed.
- **`.github/workflows/ci.yml`** and **`release.yml`**.
- **`README.md`**, **`CHANGELOG.md`**, **`SECURITY.md`** (private vulnerability reporting).

## Public API (v0.1)

```ts
signIn(options: { webClientId: string; iosClientId?: string; nonce?: string }): Promise<SignInResult>
signOut(): Promise<void>
type SignInResult =
  | { type: 'success'; idToken: string; user: { email: string; name?: string; givenName?: string;
      familyName?: string; photoUrl?: string } }
  | { type: 'cancelled' }
// coded errors: CONFIGURATION_ERROR, NO_GOOGLE_ACCOUNT, PROVIDER_UNAVAILABLE, NO_PRESENTER,
//               UNEXPECTED_CREDENTIAL, SIGN_IN_FAILED   (+ exported isErrorWithCode)
```

`user` has only the fields both platforms provide. There's no `id`: Android's
`GoogleIdTokenCredential.id` is the email, so consumers read `sub` from the token.

## Native behaviour

**Android:**
- **`signIn`:**
  - `GetSignInWithGoogleOption.Builder(serverClientId = webClientId)` (Google's option for an explicit
    button), plus `setNonce` when a nonce is given
  - `CredentialManager.create(activity).getCredentialAsync(activity, request, null, mainExecutor,
    callback)`, with the **Activity** from `appContext.currentActivity` (else `NO_PRESENTER`)
  - parse the `CustomCredential` of `TYPE_GOOGLE_ID_TOKEN_CREDENTIAL` via
    `GoogleIdTokenCredential.createFrom`
- **Error mapping** (`ErrorMapping.kt`):
  - `GetCredentialCancellationException` → cancelled
  - `NoCredentialException` → `NO_GOOGLE_ACCOUNT`
  - `GetCredentialProviderConfigurationException` / `GetCredentialUnsupportedException` →
    `PROVIDER_UNAVAILABLE`
  - wrong credential type → `UNEXPECTED_CREDENTIAL`
  - anything else → `SIGN_IN_FAILED`

  The native message is always kept.
- **`signOut`:** `clearCredentialStateAsync`.

**iOS:**
- **`signIn`** (on the main queue):
  - requires `iosClientId` (else `CONFIGURATION_ERROR`)
  - sets `GIDConfiguration(clientID: iosClientId, serverClientID: webClientId)`
  - presents from `appContext.utilities.currentViewController()` (else `NO_PRESENTER`)
  - calls `signIn(withPresenting:hint:additionalScopes:nonce:)`
  - `GIDSignInError.canceled` → cancelled
- **`signOut`:** `GIDSignIn.sharedInstance.signOut()`.
- **URL callback:** the AppDelegate subscriber calls `GIDSignIn.sharedInstance.handle(url)`.

## Implementation order

1. **L1 — Bootstrap:** AI-development docs, git and the public GitHub repo `ele-ap/expo-native-google-signin` ✅ done 2026-09-26.
2. **L2 — Scaffold** from the template, then strip it down; finalise the Commands section of
   CLAUDE.md ✅ done 2026-09-26 (SDK 57).
2b. **L2b — CI compiles, pulled forward from L6** (maintainer decision 2026-09-26). Add
   `.github/workflows/ci.yml` now: the JS job (lint, typecheck, build, Jest), the example prebuild
   plus Android `assembleDebug` on ubuntu, and prebuild plus `pod install` plus a simulator
   `xcodebuild` on macOS. Work from a draft PR so every L3–L5 push is compiled natively. L6 keeps
   the remaining tests, plugin tests and `release.yml`. ✅ done 2026-09-26 (CI green on PR #1).
3. **L3 — Android Kotlin + error mapping.** This is the actual deprecation fix, so it goes first.
   ✅ done 2026-09-26: Credential Manager flow, `ErrorMapping.kt` and its JVM unit test (run in CI).
4. **L4 — iOS Swift + AppDelegate subscriber.** ✅ done 2026-09-26: GoogleSignIn sign-in/out and
   `ErrorMapping.swift` (the AppDelegate URL forwarding dates from L2).
5. **L5 — JS wrapper, web stub, config plugin.** ✅ done 2026-09-26: JS validation, Expo Go
   error, `iosUrlScheme` → `CFBundleURLTypes`, the example sign-in screen, and the Jest + plugin tests
   (pulled forward from L6; CI runs both).
6. **L6 — Tests + release CI.** The remaining Jest and plugin tests, the Kotlin unit test, and `release.yml`.
   ✅ done 2026-09-26: the tests landed in L3/L5; `release.yml` (tag-on-main check, OIDC or token, provenance).
7. **L7 — Docs:** README, CHANGELOG, SECURITY. ✅ done 2026-09-26.
8. **L8 — Publish `0.1.0-beta.0` to npm** (`next` tag).
9. **L9 — Consumer validation**, then **`0.1.0` (`latest`)**.

## Test strategy

- **Jest (`expo-module-scripts`):**
  - the plugin adds the scheme exactly once, keeps existing schemes, and rejects bad input
  - `index.ts` validation: an empty `webClientId` → `CONFIGURATION_ERROR`, and native is never called
  - the web stub throws the documented code
- **Kotlin JVM unit test** of `ErrorMapping.kt`, if the androidx exception classes can be constructed
  in a plain JVM test (`unitTests.returnDefaultValues = true`); otherwise the example app's device run
  covers it.
- **CI (`ci.yml`, on PRs + `main`):**
  - lint, typecheck, build and Jest on ubuntu
  - example prebuild + `./gradlew :app:assembleDebug` on ubuntu (**compiles the Kotlin**)
  - example prebuild + `pod install` + `xcodebuild` for the simulator on `macos-26` (Xcode 26.6 pinned; see `ci.yml`) (**compiles
    the Swift**)
- **Maintainer device test** with the example app on both platforms:
  - sign in, cancel, the no-account case, sign out
  - the Android logcat shows **no** legacy-API warning

## Edge cases

- **Play App Signing:** Play-installed builds are re-signed, so the GCP Android client needs **both**
  SHA-1s (upload + app signing). Without them, sign-in fails only for Play installs, often as
  `NO_GOOGLE_ACCOUNT`. Documented prominently in the README.
- **No Google account / no Play services / emulator without a Play Store image:** coded errors, all
  documented.
- **Backgrounded mid-tap:** `NO_PRESENTER`.
- **Expo Go:** the native module is missing, so the JS throws a clear "requires a development build"
  error.
- **Accidental leak of app-specific config:** never commit IDs, keys or keystores (CLAUDE.md rule plus
  review).
- **Release-age gates in consumers:** documented. Consumers pin exact versions, and releases carry
  npm provenance.

## Publishing (needs your npm account)

- **First publish:** npm trusted publishing needs an existing package, so `0.1.0-beta.0` goes out
  manually by you (`npm publish --access public --tag next`) or via an `NPM_TOKEN` repo secret you
  add.
- **After that:** configure npm trusted publishing for `release.yml` (tag `v*` →
  `npm publish --provenance`) and delete the token.

## Definition of done

- **CI is green on `main`:** Jest, plus the Android and iOS example compiles.
- **README is complete:**
  - install and config plugin
  - requirements: Expo SDK 57 and Xcode 26+ (see ARCHITECTURE.md → CI builds iOS with Xcode 26)
  - GCP setup with both SHA-1s
  - Supabase `signInWithIdToken` example (nonce pattern shown) and a Firebase note
  - error codes
  - migration from `@react-native-google-signin/google-signin`
  - "not affiliated with or endorsed by Google"
- **Published:** `0.1.0` on npm with provenance, and CHANGELOG entry written.
- **Validated:** the maintainer device test and one real consumer app on both platforms pass.
- **Wrapped up:** plan archived, progress.md and ARCHITECTURE.md updated.
