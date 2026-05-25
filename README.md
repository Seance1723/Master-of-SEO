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
seo-master "/seo-master trust-audit"
seo-master "/seo-master eeat-audit --page '{\"isYMYL\":true}'"
seo-master "/seo-master security-audit --page '{\"usesHttps\":false}'"
seo-master "/seo-master accessibility-audit --html '<html><body><img src=\"hero.jpg\"></body></html>'"
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

Typing `/` shows all available Master of SEO commands. SEO logic only runs when input starts with `/seo-master`.

## Planned Commands

- `/seo-master audit-website`
- `/seo-master competitor-analysis`
- `/seo-master seo-plan`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`
- `/seo-master report`

## Trust, Security & Accessibility Scope

Group 13 implements trust audits, E-E-A-T audits, author/reviewer trust, organization trust, contact transparency, trust pages, testimonial/review authenticity guardrails, legal policy readiness, security audits, HTTPS/mixed content guardrails, malware/hacked content signals, form trust/safety, accessibility audits, semantic HTML, heading accessibility, image alt accessibility, form accessibility, keyboard navigation, contrast/readability checks, and recommendations.

Group 13 does not perform live security scanning, malware scanning, accessibility crawling, or external validation unless provider support is added later. It safely audits provided trust, security, and accessibility inputs only.

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
- Group 14: CMS & Framework SEO - next
- Group 15: Website Audit
- Group 16: Competitor Analysis
- Group 17: SEO Strategy & Campaign Planning
- Group 18: Measurement, Reporting & Governance

## Memory System

Project memory lives in `memory/master-of-seo.memory.json`. Before starting a new group, read memory first. After every group, update memory and README.

## Compatibility

Master of SEO is designed for OpenAI agents, Claude, Antigravity, Windsurf, Cursor, Continue, VS Code agents, and other MCP-compatible tools.

## Current Status

- Current status: Group 13 completed
- Next group: Group 14 CMS & Framework SEO
