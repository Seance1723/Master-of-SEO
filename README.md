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
seo-master "/seo-master framework-seo-audit"
seo-master "/seo-master wordpress-seo-audit --cms '{\"name\":\"wordpress\",\"settings\":{\"discourageSearchEngines\":true}}'"
seo-master "/seo-master nextjs-seo-audit --build '{\"status\":\"failed\",\"errors\":[\"metadata generation failed\"]}'"
seo-master "/seo-master build-seo-check --build '{\"status\":\"passed\",\"generatedSitemap\":false}'"
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

Typing `/` shows all available Master of SEO commands. SEO logic only runs when input starts with `/seo-master`.

## Planned Commands

- `/seo-master audit-website`
- `/seo-master competitor-analysis`
- `/seo-master seo-plan`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`
- `/seo-master report`

## CMS & Framework SEO Scope

Group 14 implements CMS/framework audits, WordPress SEO, permalink checks, archive/attachment indexing checks, SEO plugin conflict guardrails, WordPress theme performance review, React SEO, Next.js SEO, static website SEO, SPA risk guardrails, SSR/SSG readiness, dynamic metadata, route-level SEO, sitemap/robots/canonical generation guards, Open Graph/social metadata, JSON-LD rendering guardrails, build validation, and recommendations.

Group 14 does not run live builds, CMS scans, plugin scans, or crawling unless provider/runtime support is added later. It safely audits provided CMS, framework, route, config, build, and HTML inputs only.

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
- Group 15: Website Audit - next
- Group 16: Competitor Analysis
- Group 17: SEO Strategy & Campaign Planning
- Group 18: Measurement, Reporting & Governance

## Memory System

Project memory lives in `memory/master-of-seo.memory.json`. Before starting a new group, read memory first. After every group, update memory and README.

## Compatibility

Master of SEO is designed for OpenAI agents, Claude, Antigravity, Windsurf, Cursor, Continue, VS Code agents, and other MCP-compatible tools.

## Current Status

- Current status: Group 14 completed
- Next group: Group 15 Website Audit
