# Group 1: Core SEO Orchestration

## Purpose

Provide the safe orchestration layer for Master of SEO: trigger gating, command routing, memory, CLI, MCP, rules, priorities, scoring, and foundational detectors.

## Active Modules

- `/seo-master help`
- `/seo-master memory`
- `/seo-master next-group`

## Do

- Activate only when input starts with `/seo-master`.
- Show all commands when the user types `/`.
- Route planned modules to planned-module responses.
- Read memory before future group work.
- Update memory and README after every group.
- Keep npm package metadata publish-ready.
- Keep MCP behavior aligned with the CLI orchestrator.

## Don't

- Do not run SEO logic from plain text.
- Do not activate from generic SEO mentions.
- Do not create agent-specific behavior that breaks MCP-compatible clients.
- Do not mark planned modules active before implementation.

## Trigger Rules

- Plain text: inactive.
- `/`: show command menu.
- `/seo-master <command>`: activate and route.

## Command Routing Rules

Use `src/core/command-registry.ts` and `src/data/commands.json` as the source of truth.

## Memory Rules

Use `memory/master-of-seo.memory.json`. Before any next group, read memory first. After group completion, update completed groups, active group, task log, and timestamp.

## README Rules

After every group, update current status and next group.

## MCP Rules

`seo_master_run` must call the same orchestrator as CLI and respect all trigger rules.

## npm Publishing Rules

Keep ESM, typed exports, bin commands, build script, files list, and package metadata ready for npm.
