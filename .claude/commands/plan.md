---
description: Create a structured plan for a feature using /plan mode
argument-hint: "[feature or task to plan]"
---
Enter plan mode, then create a complete implementation plan for: $ARGUMENTS

Before planning:
- Read docs/ARCHITECTURE.md to understand existing patterns and decisions
- Read docs/progress.md to understand current project state
- If the explorer subagent has already researched this area, use those findings

The plan must include:
- Objective: what this feature does and why
- Files to create or modify: exact paths and what changes in each
- Implementation order: the sequence of changes and why
- Test strategy: what tests will be written and what they verify
- Edge cases: anything that could go wrong and how to handle it
- Definition of done: how we know this is complete

Save the completed plan to:
  docs/plans/active/YYYY-MM-DD-[short-description].md
(Use today's date and a kebab-case description)

Do not implement anything. Wait for explicit approval before proceeding.
Respond with: "Plan saved to [filename]. Ready for your review."
