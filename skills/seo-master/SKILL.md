---
name: seo-master
description: Master of SEO workflow skill for SEO strategy, audits, keyword research, content briefs, on-page optimization, competitor gaps, schema planning, and project memory. Use only when the user explicitly types /seo-master or asks to continue an active /seo-master workflow; stay inactive for all other SEO questions, generic marketing requests, or casual mentions of SEO.
---

# Master of SEO

## Gate

Stay inactive unless the user uses `/seo-master` or is already inside an active `/seo-master` workflow.

If the user types `/` while the workflow is active, show every available Master of SEO action from `references/actions.md`.

## Required Loop

Before starting any next group or module:

1. Read `references/project-memory.md`.
2. Confirm the active action and expected output.
3. Read the matching modular action file from `references/actions/`.

After every group or module:

1. Update `references/project-memory.md` with decisions, outputs, assumptions, blockers, and next action.
2. Update the root `README.md` Current Status section.
3. Keep the explanation short.

## Action Routing

Use `references/actions.md` as the action registry.

- `/seo-master /project-start`: read `references/actions/project-start.md`.
- `/seo-master /technical-audit`: read `references/actions/technical-audit.md`.
- `/seo-master /keyword-research`: read `references/actions/keyword-research.md`.
- `/seo-master /content-brief`: read `references/actions/content-brief.md`.
- `/seo-master /on-page`: read `references/actions/on-page.md`.
- `/seo-master /competitor-gap`: read `references/actions/competitor-gap.md`.
- `/seo-master /schema-plan`: read `references/actions/schema-plan.md`.
- `/seo-master /group-complete`: read `references/actions/group-complete.md`.

## MCP Support

Prefer the package MCP server when available:

```bash
master-of-seo-mcp
```

The MCP server exposes tools to list actions, read action modules, read/update memory, and complete a group with README status updates.

## Compatibility

Keep outputs agent-neutral and file-based so OpenAI, Claude, Antigravity, Windsurf, Cursor, Continue, VS Code agents, and other MCP clients can use the same instructions.
