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
seo-master "/seo-master performance-audit --metrics '{\"lcp\":3.2,\"inp\":240,\"cls\":0.15}'"
seo-master "/seo-master performance-audit --html '<html>...</html>'"
```

## Active Commands

- `/seo-master help`
- `/seo-master memory`
- `/seo-master next-group`
- `/seo-master technical-audit`
- `/seo-master performance-audit`

Typing `/` shows all available Master of SEO commands. SEO logic only runs when input starts with `/seo-master`.

## Planned Commands

- `/seo-master audit-website`
- `/seo-master competitor-analysis`
- `/seo-master keyword-research`
- `/seo-master seo-plan`
- `/seo-master content-plan`
- `/seo-master on-page-audit`
- `/seo-master schema-audit`
- `/seo-master local-seo`
- `/seo-master ecommerce-seo`
- `/seo-master ai-search-readiness`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`
- `/seo-master report`

## Technical SEO Scope

Group 2 implements Search Essentials, spam policy compliance, crawlability, indexability, robots.txt, meta robots, X-Robots-Tag, XML sitemap, URL structure, canonicalization, redirects, and HTTP status code checks.

Group 2 does not perform full live crawling unless crawler support is added later. It audits provided inputs safely.

## Performance SEO Scope

Group 3 implements Core Web Vitals, LCP, INP, CLS, TTFB, asset optimization, image performance, font performance, JavaScript performance, CSS performance, third-party script checks, and performance recommendations.

Group 3 does not perform full live Lighthouse crawling unless crawler/performance collection support is added later. It audits provided metrics, HTML, headers, and asset data safely.

## MCP Usage

Run the MCP server:

```bash
npm run mcp
```

Client config example:

```json
{
  "mcpServers": {
    "master-of-seo": {
      "command": "seo-master",
      "args": ["mcp"]
    }
  }
}
```

The MCP server exposes:

- Tool: `seo_master_run`
- Tool: `seo_master_commands`
- Tool: `seo_master_technical_audit`
- Tool: `seo_master_performance_audit`
- Resource: `seo-master://memory`
- Resource: `seo-master://commands`
- Resource: `seo-master://groups`
- Resource: `seo-master://technical-rules`
- Resource: `seo-master://performance-rules`
- Prompts: `seo-master-performance-audit`, `seo-master-technical-audit`, `seo-master-audit`, `seo-master-keyword-research`, `seo-master-competitor-analysis`, `seo-master-seo-plan`

## Group Roadmap

- Group 1: Core SEO Orchestration - completed
- Group 2: Technical SEO - completed
- Group 3: Performance SEO - completed
- Group 4: On-Page SEO - next
- Group 5: Keyword Research & Intent
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

- Current status: Group 3 completed
- Next group: Group 4 On-Page SEO
