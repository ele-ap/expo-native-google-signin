---
description: Send review findings back to the implementer subagent for fixes
---

Read the most recent code review report from this session.

Use the implementer subagent to address all BLOCKER and MAJOR findings.

Rules:

- Fix only what the review flagged — do not touch anything else
- After fixing, run the test suite to confirm nothing broke
- Report exactly what was changed and what the test results are

After fixes are complete, automatically run /review again to confirm
all BLOCKERs and MAJORs are resolved.
