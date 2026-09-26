---
description: Verify the commit and push succeeded before the next /plan
---

After running `/commit` and executing the suggested `git commit && git push`, run this to confirm everything is in the right state.

Checks:

1. Working tree is clean (no uncommitted changes).

2. The latest commit on the branch matches what was intended:
   - Commit message is correct.
   - Files changed match the scope (no surprises).

3. Branch is synced with origin:
   - No commits ahead of or behind origin.
   - Remote tracking is set correctly.

4. (Optional) Suggest cleanup of stale remote branches
   (e.g., after a branch rename).

Report the git state clearly. If anything is out of sync (uncommitted changes,
unpushed commits, stale tracking), flag it as a blocker before the user starts
the next `/plan`. If all is good, confirm: **ready for the next /plan**.
