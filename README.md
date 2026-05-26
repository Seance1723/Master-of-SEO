# Master of SEO

Master of SEO is an npm-ready, MCP-compatible AI skill for orchestrating SEO workflows through a strict slash trigger.

Master of SEO does not activate automatically. Use /seo-master to trigger the skill.

## Install

```bash
npm install -g master-of-seo
```

## CLI Usage

```bash
seo-master
seo-master /
seo-master "/seo-master help"
seo-master "/seo-master seo-plan"
seo-master "/seo-master seo-strategy --business '{\"websiteType\":\"saas\",\"businessGoals\":[\"demo_booking\"]}'"
seo-master "/seo-master launch-checklist --launch '{\"isNewWebsite\":true,\"hasAnalytics\":false}'"
seo-master "/seo-master migration-plan --migration '{\"isMigration\":true,\"migrationType\":\"url_structure\"}'"
```

## Active Commands

- `/seo-master help`
- `/seo-master memory`
- `/seo-master next-group`
- `/seo-master technical-audit`
- `/seo-master performance-audit`
- `/seo-master on-page-audit`
- `/seo-master keyword-research`
- `/seo-master content-plan`
- `/seo-master architecture-audit`
- `/seo-master internal-linking-audit`
- `/seo-master schema-audit`
- `/seo-master schema-generate`
- `/seo-master media-audit`
- `/seo-master image-seo-audit`
- `/seo-master video-seo-audit`
- `/seo-master ecommerce-seo`
- `/seo-master ecommerce-audit`
- `/seo-master product-seo-audit`
- `/seo-master category-seo-audit`
- `/seo-master local-seo`
- `/seo-master local-seo-audit`
- `/seo-master international-seo`
- `/seo-master international-seo-audit`
- `/seo-master hreflang-audit`
- `/seo-master ai-search-readiness`
- `/seo-master ai-search-audit`
- `/seo-master answer-block-audit`
- `/seo-master discover-seo-audit`
- `/seo-master ai-content-quality-audit`
- `/seo-master trust-audit`
- `/seo-master eeat-audit`
- `/seo-master security-audit`
- `/seo-master accessibility-audit`
- `/seo-master framework-seo-audit`
- `/seo-master wordpress-seo-audit`
- `/seo-master react-seo-audit`
- `/seo-master nextjs-seo-audit`
- `/seo-master static-seo-audit`
- `/seo-master build-seo-check`
- `/seo-master audit-website`
- `/seo-master website-audit`
- `/seo-master full-audit`
- `/seo-master page-audit`
- `/seo-master competitor-analysis`
- `/seo-master competitor-audit`
- `/seo-master competitor-keyword-gap`
- `/seo-master competitor-content-gap`
- `/seo-master competitor-backlink-gap`
- `/seo-master serp-analysis`
- `/seo-master seo-plan`
- `/seo-master seo-strategy`
- `/seo-master seo-campaign-plan`
- `/seo-master opportunity-plan`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`

Typing `/` shows all available Master of SEO commands. SEO logic only runs when input starts with `/seo-master`.

## Planned Commands

- `/seo-master report`

## SEO Strategy & Campaign Planning Scope

Group 17 implements SEO strategy, SEO plan generation, campaign planning, goal mapping, opportunity prioritization, impact-effort matrix, 30/60/90 roadmap, technical/content/authority/conversion roadmaps, launch checklist, migration plan, resource planning, SEO risk planning, and strategy reporting.

Group 17 does not fetch live audit, ranking, keyword, traffic, competitor, launch, or migration data unless provider support is added later. It safely creates SEO strategy and planning outputs from provided inputs only.

## MCP Usage

Run the MCP server:

```bash
npm run mcp
```

The MCP server exposes `seo_master_run`, `seo_master_commands`, active audit/planning tools, and rule resources.

## Group Roadmap

- Group 1: Core SEO Orchestration - completed
- Group 2: Technical SEO - completed
- Group 3: Performance SEO - completed
- Group 4: On-Page SEO - completed
- Group 5: Keyword Research & Intent - completed
- Group 6: Content Strategy & Planning - completed
- Group 7: Site Architecture & Internal Linking - completed
- Group 8: Schema & Entity SEO - completed
- Group 9: Media SEO - completed
- Group 10: Ecommerce SEO - completed
- Group 11: Local & International SEO - completed
- Group 12: AI Search & Discover SEO - completed
- Group 13: Trust, Security & Accessibility - completed
- Group 14: CMS & Framework SEO - completed
- Group 15: Website Audit - completed
- Group 16: Competitor Analysis - completed
- Group 17: SEO Strategy & Campaign Planning - completed
- Group 18: Measurement, Reporting & Governance - next

## Memory System

Project memory lives in `memory/master-of-seo.memory.json`. Before starting a new group, read memory first. After every group, update memory and README.

## Compatibility

Master of SEO is designed for OpenAI agents, Claude, Antigravity, Windsurf, Cursor, Continue, VS Code agents, and other MCP-compatible tools.

## Current Status

- Current status: Group 17 completed
- Next group: Group 18 Measurement, Reporting & Governance
