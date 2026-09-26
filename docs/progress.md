# Project progress

## Current phase

**v0.1.0 in preparation — module scaffolded (Expo SDK 57).** Build, lint, typecheck and Jest work
locally; native `signIn`/`signOut` are still stubs that reject with "not implemented".

## Active plan

`docs/plans/active/2026-09-26-v0-1-0-initial-release.md` — **L1 ✅, L2 (scaffold) ✅ done
2026-09-26.** Next step: **L2b — CI native compiles, pulled forward** (draft PR), then **L3 — Android**
(Credential Manager `signIn`/`signOut` + `ErrorMapping.kt`).

## Up next

1. L2b CI compiles (draft PR) → L3 Android (Credential Manager) → L4 iOS (`GoogleSignIn`) → L5 JS wrapper / web stub
   / config plugin → L6 tests + CI (native compiles) → L7 docs.
2. L8 publish `0.1.0-beta.0` (`next` tag) — **needs the maintainer's npm account** (first publish is
   manual or via an `NPM_TOKEN` secret; trusted publishing is configured after the package exists).
3. L9 validate in a real consumer app on both platforms → publish `0.1.0` (`latest`).

## Completed

- **2026-09-26 — Bootstrap (L1):** public repo `ele-ap/expo-native-google-signin` (MIT), AI-development docs, subagents and commands.
- **2026-09-26 — Scaffold (L2):** Expo module on SDK 57 (`expo-module-scripts` tooling), JS types and
  web stub, config-plugin skeleton, Android/iOS stubs with the Google dependencies declared, example
  app wired to `EXPO_PUBLIC_*` env vars; real Commands section in CLAUDE.md.
