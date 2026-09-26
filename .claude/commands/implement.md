---
description: Execute the active plan using the implementer subagent
---

Read the active plan file in docs/plans/active/

If no active plan exists, respond with:
"No active plan found in docs/plans/active/.
Run /plan first to create one."

If a plan exists, use the implementer subagent to execute it with
these instructions:

- Read CLAUDE.md, docs/ARCHITECTURE.md, and the active plan before
  writing any code
- Read all files that will be modified before touching them
- Stay strictly within the scope of the plan — no extra refactors,
  no unrequested changes
- Write or update tests for every change
- Run the test suite and fix any failures before finishing
- Report: files changed, test results, and any decisions made

After the implementer finishes, report its output summary here.
