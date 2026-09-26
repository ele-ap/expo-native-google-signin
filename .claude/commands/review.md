---
description: Run the code-reviewer subagent on current changes
---

Use the code-reviewer subagent to review all changes made in the
current implementation.

The reviewer must:

- Read CLAUDE.md and docs/ARCHITECTURE.md before reviewing
- Run git diff to identify all changed files
- Review for: correctness, security, performance, and convention consistency
- Tag every issue: BLOCKER, MAJOR, or NIT
- Any violation of a rule in CLAUDE.md is automatically a BLOCKER

Return the full review report and end with one of:
APPROVE
APPROVE WITH NITS
CHANGES REQUESTED

If CHANGES REQUESTED: list all BLOCKERs and MAJORs clearly so they
can be passed directly to the implementer subagent for fixes.
