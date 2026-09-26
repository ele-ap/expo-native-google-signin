# Project progress

## Current phase

**Bootstrap — v0.1.0 in preparation.** The repository holds the AI-development structure (CLAUDE.md,
ARCHITECTURE.md, plans, subagents and commands) but no module code yet.

## Active plan

`docs/plans/active/2026-09-26-v0-1-0-initial-release.md` — **L1 (bootstrap) ✅ done 2026-09-26.**
Next step: **L2 — scaffold** the module from `expo-module-template` (SDK 56) and replace the
"Commands" section of CLAUDE.md with the real commands.

## Up next

1. L2 scaffold → L3 Android (Credential Manager) → L4 iOS (`GoogleSignIn`) → L5 JS wrapper / web stub
   / config plugin → L6 tests + CI (native compiles) → L7 docs.
2. L8 publish `0.1.0-beta.0` (`next` tag) — **needs the maintainer's npm account** (first publish is
   manual or via an `NPM_TOKEN` secret; trusted publishing is configured after the package exists).
3. L9 validate in a real consumer app on both platforms → publish `0.1.0` (`latest`).

## Completed

- **2026-09-26 — Bootstrap (L1):** public repo `ele-ap/expo-native-google-signin` (MIT), AI-development docs, subagents and commands.
