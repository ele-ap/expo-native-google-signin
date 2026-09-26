---
description: Complete the cycle — update docs, archive plan, prepare commit
---

The review is approved. Complete the development cycle:

1. Move the active plan from docs/plans/active/ to docs/plans/completed/
   (keep the same filename)

2. Update docs/progress.md:
   - Mark the completed feature as done with a one-line summary
   - Update "Active plan" to "none"
   - Update "Up next" based on what logically follows

3. Check if any new architectural decisions were made during this
   implementation that are not yet in docs/ARCHITECTURE.md.
   If so, add them now.

4. Check if any new project convention, command, gotcha, or durable
   decision from this implementation is not yet reflected in CLAUDE.md.
   If so, update the relevant section of CLAUDE.md now.

5. Suggest a git commit message in this format:
   feat: [short description]
   - [bullet: what was built]
   - [bullet: what was tested]
   - [bullet: any architectural decision worth noting]

6. Remind me to run: git add -A && git commit -m "[the message above]"

Do not run the git commit yourself — present it for my approval.
