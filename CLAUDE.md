# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**`expo-native-google-signin`** — a small, open-source (**MIT**) Expo module for **native Google
sign-in on Android and iOS**, built only on Google's first-party SDKs:

- **Android:** Credential Manager (`androidx.credentials` + `com.google.android.libraries.identity.googleid`)
  — the replacement for the deprecated `play-services-auth` `GoogleSignInClient`.
- **iOS:** the `GoogleSignIn` SDK (`google/GoogleSignIn-iOS`).

It returns a **Google ID token** that any backend can verify (Supabase `signInWithIdToken`, Firebase,
a custom server). npm: `expo-native-google-signin` · GitHub: `ele-ap/expo-native-google-signin`.

**[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** records _why_ structural choices were made and
**[docs/progress.md](./docs/progress.md)** tracks current state + the active plan. Read both before
non-trivial work (see "Plan and documentation structure" below).

## Key decisions

Durable choices (full reasoning in ARCHITECTURE.md) — flag before reversing:

- **First-party Google SDKs only.** No dependency on `@react-native-google-signin/google-signin` or any
  other community sign-in wrapper.
- **Minimal public surface:** `signIn`, `signOut`, and one config-plugin option (`iosUrlScheme`). New
  API surface needs an ARCHITECTURE.md entry first.
- **Cancel resolves `{ type: 'cancelled' }`; real failures reject with a coded error.** Both platforms
  return the same result shape and the same error codes — keep them aligned.
- **No `androidClientId`.** Google matches Android apps by package name + signing SHA-1; the web
  client ID is the `serverClientId` on both platforms.
- **No web implementation** — the web entry point is a stub that throws a clear error.

## Public-repo hygiene (non-negotiable)

This repository is **public**. Never commit:

- OAuth client IDs, signing SHA-1s, keystores, `google-services.json`, `GoogleService-Info.plist`,
  `.env*` files, npm tokens, or any other secret/credential;
- names, URLs, project refs or other internals of any consumer app.

The example app reads client IDs from `EXPO_PUBLIC_*` environment variables only. Check every diff for
identifiers before pushing. Don't use Google logos or imply endorsement — the README states the
project is not affiliated with or endorsed by Google.

## Commands

_Not set up yet — plan step **L2** scaffolds the module (from `expo-module-template`, with
`expo-module-scripts`) and must replace this section with the real build / lint / test / example-app
commands._

## Architecture (planned layout — finalised in L2)

- `src/` — typed JS wrapper (`index.ts`), web stub (`index.web.ts`), types
- `plugin/` — Expo config plugin (iOS URL scheme), built to `app.plugin.js`
- `android/` — Kotlin module (Credential Manager)
- `ios/` — Swift module + AppDelegate subscriber (`GoogleSignIn`)
- `example/` — Expo app for manual device testing; also what CI compiles natively
- `.github/workflows/` — `ci.yml` (JS checks + Android/iOS example compiles), `release.yml` (npm publish)

## Conventions

- **Native changes must pass the CI Android + iOS example compiles before merge.** Local sessions may
  not be able to compile native code (e.g. cloud containers without Google Maven / Xcode) — CI is the
  proof, not a local `tsc`.
- **Semver.** Pre-1.0, a minor bump may break the API. Every release gets a `CHANGELOG.md` entry and
  is published from CI with npm provenance.
- **Consumers pin exact versions** — say so in the README.

---

## Plan and documentation structure

This project uses a three-layer documentation system. Always follow these rules:

### Directory layout

- docs/ARCHITECTURE.md — permanent record of WHY structural decisions were made
- docs/progress.md — current project state, active phase, what is next
- docs/plans/active/ — the single currently active plan file
- docs/plans/completed/ — archived plans, renamed after completion
- docs/plans/backlog/ — living list (`README.md`) of discovered fixes/enhancements with no home in the numbered roadmap; items still go through `/plan → /implement → /review` when picked up

### Plan file naming convention

Name plan files descriptively with a date prefix:
YYYY-MM-DD-short-description.md
Example: 2026-06-04-add-auth-flow.md

### Rules for every planning session

1. Before creating a new plan, read docs/progress.md and docs/ARCHITECTURE.md first
2. Create the plan in docs/plans/active/ before starting implementation
3. After completing a plan, move it to docs/plans/completed/
4. After completing a plan, harvest any architectural decisions into docs/ARCHITECTURE.md
5. After completing a plan, update docs/progress.md to reflect the new state
6. Never load completed plans into context — they belong in git history, not the active window
7. Keep only ONE plan in docs/plans/active/ at a time

### Rules for CLAUDE.md updates

When you learn a new project convention, decision, or rule mid-session, add it to the relevant section of CLAUDE.md immediately by editing the file directly (in Claude Code you can also use the `#` shortcut). Do not wait until the end of the session.

### Session startup sequence

At the start of every new session on this project:

1. Read CLAUDE.md
2. Read docs/progress.md
3. Read docs/ARCHITECTURE.md
4. Read the active plan in docs/plans/active/ if one exists
5. Only then ask what to work on or proceed with the stated task

---

## Subagent delegation rules

Three project-scoped subagents are defined in `.claude/agents/`: `explorer` (read-only
codebase search), `code-reviewer` (read-only review of staged changes), and `implementer`
(scoped, plan-driven coding). Always follow these delegation rules without being asked:

- Before exploring or reading the codebase to understand how something works,
  always delegate to the explorer subagent first.
- After completing any feature implementation, always invoke the code-reviewer
  subagent before considering the task done.
- When asked to implement a well-scoped task that has an active plan in
  docs/plans/active/, delegate the implementation to the implementer subagent.
- Never do codebase exploration in the main session when the explorer subagent
  can handle it — protect the main context window.

---

## Development workflow

Every feature follows this exact cycle. Do not skip steps.

/startup → load project context (run at the start of every session)
/explore → research the codebase before planning
/plan → create and save a plan, wait for approval
/implement → execute the approved plan via the implementer subagent
/review → review changes via the code-reviewer subagent
/fix → address review findings, then re-review automatically
/commit → archive plan, update docs (progress.md, ARCHITECTURE.md, **and CLAUDE.md** if conventions changed), prepare commit message
/verify-commit → confirm commit/push succeeded and working tree is clean before the next /plan

### Rules that cannot be skipped

- Never implement without an approved plan in docs/plans/active/
- Never commit without an APPROVE verdict from the code-reviewer subagent
- Never start a new session without running /startup first
- Always run /explore before /plan for any task touching existing code
- During /commit, always check whether CLAUDE.md needs updating for any new convention/gotcha/command
- Never start the next /plan without running /verify-commit after the previous /commit

### Agent roles

- Explorer (read-only): codebase research and discovery
- Implementer (full tools): writing code and tests
- Code-reviewer (read-only): quality gate before every commit
- Parent session: planning, approval decisions, orchestration

### Gate logic

Explore → Plan → [YOUR APPROVAL] → Implement → Review → [APPROVE?]
→ If no: Fix → Re-review → repeat until APPROVE
→ If yes: Commit → update docs → next feature
