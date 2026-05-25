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
seo-master "/seo-master architecture-audit"
seo-master "/seo-master internal-linking-audit"
seo-master "/seo-master architecture-audit --pages '[{\"url\":\"/\",\"pageType\":\"homepage\"}]' --links '[]'"
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

Typing `/` shows all available Master of SEO commands. SEO logic only runs when input starts with `/seo-master`.

## Planned Commands

- `/seo-master audit-website`
- `/seo-master competitor-analysis`
- `/seo-master seo-plan`
- `/seo-master schema-audit`
- `/seo-master local-seo`
- `/seo-master ecommerce-seo`
- `/seo-master ai-search-readiness`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`
- `/seo-master report`

## Site Architecture & Internal Linking Scope

Group 7 implements site architecture, URL hierarchy, navigation structure, crawl depth approximation, orphan page detection, internal linking, anchor text checks, breadcrumb checks, topic cluster linking, link equity recommendations, and audit reporting.

Group 7 does not perform full live crawling unless crawler support is added later. It safely analyzes provided page, link, navigation, breadcrumb, sitemap, and topic cluster inputs.

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
- Group 8: Schema & Entity SEO - next
- Group 9: Media SEO
- Group 10: Ecommerce SEO
- Group 11: Local & International SEO
- Group 12: AI Search & Discover SEO
- Group 13: Trust, Security & Accessibility
- Group 14: CMS & Framework SEO
- Group 15: Website Audit
- Group 16: Competitor Analysis
- Group 17: SEO Strategy & Campaign Planning
- Group 18: Measurement, Reporting & Governance

## Memory System

Project memory lives in `memory/master-of-seo.memory.json`. Before starting a new group, read memory first. After every group, update memory and README.

## Compatibility

Master of SEO is designed for OpenAI agents, Claude, Antigravity, Windsurf, Cursor, Continue, VS Code agents, and other MCP-compatible tools.

## Current Status

- Current status: Group 7 completed
- Next group: Group 8 Schema & Entity SEO
