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
seo-master "/seo-master memory"
seo-master "/seo-master next-group"
seo-master "/seo-master technical-audit"
seo-master "/seo-master performance-audit"
seo-master "/seo-master on-page-audit"
seo-master "/seo-master on-page-audit --title 'Technical SEO Services' --metaDescription 'Fix technical SEO issues that block growth.'"
seo-master "/seo-master on-page-audit --html '<html>...</html>'"
```

## Active Commands

- `/seo-master help`
- `/seo-master memory`
- `/seo-master next-group`
- `/seo-master technical-audit`
- `/seo-master performance-audit`
- `/seo-master on-page-audit`

Typing `/` shows all available Master of SEO commands. SEO logic only runs when input starts with `/seo-master`.

## Planned Commands

- `/seo-master audit-website`
- `/seo-master competitor-analysis`
- `/seo-master keyword-research`
- `/seo-master seo-plan`
- `/seo-master content-plan`
- `/seo-master schema-audit`
- `/seo-master local-seo`
- `/seo-master ecommerce-seo`
- `/seo-master ai-search-readiness`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`
- `/seo-master report`

## Technical SEO Scope

Group 2 implements Search Essentials, spam policy compliance, crawlability, indexability, robots.txt, meta robots, X-Robots-Tag, XML sitemap, URL structure, canonicalization, redirects, and HTTP status code checks.

## Performance SEO Scope

Group 3 implements Core Web Vitals, LCP, INP, CLS, TTFB, asset optimization, image performance, font performance, JavaScript performance, CSS performance, third-party script checks, and performance recommendations.

## On-Page SEO Scope

Group 4 implements title tags, meta descriptions, heading structure, H1-H6 hierarchy, content structure, above-the-fold SEO, CTA/conversion checks, internal on-page links, image alt text, and on-page recommendations.

Group 4 does not perform full live crawling unless crawler support is added later. It audits provided HTML and on-page inputs safely.

## MCP Usage

Run the MCP server:

```bash
npm run mcp
```

The MCP server exposes `seo_master_run`, `seo_master_commands`, `seo_master_technical_audit`, `seo_master_performance_audit`, `seo_master_on_page_audit`, and rule resources for technical, performance, and on-page packs.

## Group Roadmap

- Group 1: Core SEO Orchestration - completed
- Group 2: Technical SEO - completed
- Group 3: Performance SEO - completed
- Group 4: On-Page SEO - completed
- Group 5: Keyword Research & Intent - next
- Group 6: Content Strategy & Planning
- Group 7: Site Architecture & Internal Linking
- Group 8: Schema & Entity SEO
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

- Current status: Group 4 completed
- Next group: Group 5 Keyword Research & Intent
