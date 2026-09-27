# Security Policy

## Supported versions

This project is pre-1.0. Only the latest `0.x` prerelease receives security fixes — see
[CHANGELOG.md](./CHANGELOG.md) for the current version.

## Reporting a vulnerability

Please report security vulnerabilities **privately**, using GitHub's private vulnerability
reporting: open this repository's **Security** tab and select **"Report a vulnerability"**. Please
do not open a public issue for security reports.

This is a single-maintainer, volunteer-run project. There's no guaranteed response-time SLA, but
reports are triaged on a best-effort basis.

## Scope

`expo-native-google-signin` is a thin wrapper around Google's own first-party SDKs (Android
Credential Manager, the iOS `GoogleSignIn` SDK):

- Token handling — requesting, validating and refreshing the underlying credential — happens inside
  those SDKs, not in this module's own code.
- This module never persists an ID token or any credential; it only returns the native SDK's result
  to the caller for a single `signIn` call.
- The example app never logs or displays a full ID token, only a short, unusable prefix (see
  `example/App.tsx`).

Vulnerabilities in Google's own SDKs should be reported to Google, not here.
