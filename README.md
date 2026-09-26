# expo-native-google-signin

> 🚧 **Work in progress — not published yet.**

Native Google sign-in for Expo apps on **Android** and **iOS**, built only on Google's first-party
SDKs:

- **Android:** [Credential Manager](https://developer.android.com/identity/sign-in/credential-manager-siwg)
  (`androidx.credentials` + Google ID), the replacement for the deprecated legacy Google Sign-In API
  in `play-services-auth`.
- **iOS:** the [`GoogleSignIn`](https://github.com/google/GoogleSignIn-iOS) SDK.

It returns a **Google ID token** for your backend (Supabase `signInWithIdToken`, Firebase, or your own
server). Planned API: `signIn({ webClientId, iosClientId?, nonce? })` and `signOut()`.

Progress and design notes live in [`docs/`](./docs).

This project is not affiliated with or endorsed by Google.

## License

[MIT](./LICENSE)
