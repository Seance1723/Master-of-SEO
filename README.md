# Master of SEO

An AI-agent SEO skill that turns any coding assistant into a technical SEO auditor, strategist, and website optimization partner.

Master of SEO gives AI agents a structured SEO brain: it can audit provided website data, review SEO-sensitive code and HTML, map keywords to intent, analyze competitor inputs, generate roadmaps, protect launches and migrations, and produce governance-ready reports.

[![npm](https://img.shields.io/badge/npm-master--of--seo-cb3837?style=flat-square)](https://www.npmjs.com/package/master-of-seo)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)
[![MCP Ready](https://img.shields.io/badge/MCP-ready-blue?style=flat-square)](#mcp-usage)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![AI Agent Skill](https://img.shields.io/badge/AI%20Agent-skill-7c3aed?style=flat-square)](#why-master-of-seo)
[![CLI Ready](https://img.shields.io/badge/CLI-ready-111827?style=flat-square)](#cli-usage)

## Why Master of SEO?

Most AI agents can write code. Master of SEO helps them think like an SEO architect.

It brings rule-based SEO reasoning to developer workflows, covering technical SEO, on-page SEO, performance, schema/entity SEO, keyword research, content planning, competitor analysis, ecommerce, local and international SEO, AI Search readiness, trust, accessibility, reporting, governance, launches, and migrations.

Master of SEO is safe by default. It works from provided inputs unless live provider integrations are added later. It does not invent crawl results, rankings, Search Console data, GA4 data, backlinks, keyword volume, traffic, revenue, Core Web Vitals, reviews, ratings, or security status.

## What It Can Do

| Capability | What it helps with |
|---|---|
| Website Audit | Combine technical, content, schema, UX, performance, trust, and CMS findings |
| Technical SEO | Robots, sitemaps, canonicals, redirects, status codes, indexing, crawlability |
| Performance SEO | Core Web Vitals, images, JavaScript, CSS, fonts, third-party scripts |
| On-Page SEO | Titles, descriptions, headings, CTAs, internal links, image alt text |
| Keyword Research | Cluster keywords, map intent, detect cannibalization, prioritize opportunities |
| Competitor Analysis | Find keyword gaps, content gaps, backlink gaps, SERP feature opportunities |
| Content Planning | Build topic clusters, briefs, refresh plans, pruning plans, content calendars |
| Schema SEO | Audit JSON-LD and generate safe schema only from supplied facts |
| Ecommerce SEO | Product, category, variants, faceted navigation, reviews, Merchant feed readiness |
| Local & International SEO | NAP, local pages, GBP readiness, hreflang, x-default, localization |
| AI Search Readiness | Answer blocks, entity clarity, information gain, citation quality |
| Trust & Accessibility | E-E-A-T, policies, author trust, security, semantic HTML, accessibility checks |
| CMS & Framework SEO | WordPress, React, Next.js, static sites, route metadata, build SEO checks |
| Governance | SEO QA, release guard, changelog, measurement, executive reporting |

## Installation

Install globally for the CLI:

```bash
npm install -g master-of-seo
```

Install locally for package imports:

```bash
npm install master-of-seo
```

## CLI Usage

```bash
seo-master "/seo-master help"
seo-master "/seo-master audit-website"
seo-master "/seo-master keyword-research technical seo, seo audit, ecommerce seo"
seo-master "/seo-master competitor-analysis"
seo-master "/seo-master seo-plan"
seo-master "/seo-master seo-qa"
```

Commands without enough supplied data return `needs_input` instead of guessing.

```bash
seo-master "/seo-master technical-audit --html '<html><head><meta name=\"robots\" content=\"noindex\"></head></html>'"
```

Example output:

```text
P1: Page has noindex directive
Why it matters: Important pages with noindex may not appear in search.
Fix: Remove noindex from indexable public pages.
```

## Natural Agent Usage

Slash command activation:

```text
/seo-master audit-website
```

Explicit natural activation:

```text
Check what is wrong in my website and use seo-master skills.
Use Master of SEO to audit this HTML.
Apply seo-master skills to this launch checklist.
```

Master of SEO does not silently run for every SEO-related prompt. It activates only when:

- The input starts with `/seo-master`
- The user explicitly says `use seo-master`, `use Master of SEO`, or `apply seo-master skills`
- An MCP tool is called directly

## MCP Usage

Add Master of SEO as an MCP server:

```json
{
  "mcpServers": {
    "master-of-seo": {
      "command": "npx",
      "args": ["-y", "master-of-seo", "mcp"]
    }
  }
}
```

| Client | Setup |
|---|---|
| Codex | Add Master of SEO as an MCP server |
| Antigravity | Add the MCP server config |
| Windsurf | Add the MCP server config |
| VS Code | Add the MCP server in workspace or user config |
| Cursor | Add the MCP server config |
| Claude | Add the MCP server config |
| Continue | Use MCP, CLI, or package import |

Example configs live in [`examples/mcp`](./examples/mcp).

## Available Commands

### Core

```text
/seo-master help
/seo-master memory
/seo-master final-status
```

### Audit

```text
/seo-master audit-website
/seo-master website-audit
/seo-master full-audit
/seo-master page-audit
/seo-master technical-audit
/seo-master performance-audit
/seo-master on-page-audit
/seo-master schema-audit
/seo-master media-audit
/seo-master accessibility-audit
/seo-master security-audit
/seo-master trust-audit
/seo-master eeat-audit
```

### Research & Strategy

```text
/seo-master keyword-research
/seo-master content-plan
/seo-master competitor-analysis
/seo-master competitor-keyword-gap
/seo-master competitor-content-gap
/seo-master competitor-backlink-gap
/seo-master serp-analysis
/seo-master seo-plan
/seo-master seo-strategy
/seo-master seo-campaign-plan
/seo-master opportunity-plan
```

### Specialized SEO

```text
/seo-master ecommerce-seo
/seo-master ecommerce-audit
/seo-master product-seo-audit
/seo-master category-seo-audit
/seo-master local-seo
/seo-master local-seo-audit
/seo-master international-seo
/seo-master international-seo-audit
/seo-master hreflang-audit
/seo-master ai-search-readiness
/seo-master ai-search-audit
/seo-master discover-seo-audit
/seo-master ai-content-quality-audit
/seo-master framework-seo-audit
/seo-master wordpress-seo-audit
/seo-master react-seo-audit
/seo-master nextjs-seo-audit
/seo-master static-seo-audit
/seo-master build-seo-check
```

### Launch, Migration & Reporting

```text
/seo-master launch-checklist
/seo-master migration-plan
/seo-master report
/seo-master seo-report
/seo-master measurement-report
/seo-master governance-check
/seo-master seo-qa
/seo-master release-seo-check
```

## What Makes It Different

- Built for AI agents, not just dashboards
- Works through CLI, MCP, and package import
- Uses do/don't guardrails to avoid unsafe SEO recommendations
- Prioritizes findings as `P0`, `P1`, `P2`, and `P3`
- Returns `needs_input` or `partial` when evidence is missing
- Keeps live data separate from provided data
- Designed for npm distribution and MCP-compatible coding agents
- Useful for developers, SEO teams, content teams, agencies, and product teams

## Safe Data Policy

Master of SEO does not invent data. If live crawl, keyword, ranking, traffic, backlink, GA4, Search Console, revenue, review, rating, security, or Core Web Vitals data is not provided, it returns safe recommendations or asks for input.

Live crawling, Search Console reads, GA4 reads, SERP scraping, backlink checks, ranking checks, keyword API calls, and external validation require future provider integrations.

## Library Usage

```ts
import { runSeoMaster } from "master-of-seo";

const result = await runSeoMaster(
  "/seo-master keyword-research technical seo, seo audit"
);

console.log(result);
```

Useful exports include the command registry, memory helpers, MCP server entry, and core types.

## Documentation

- [Getting started](./docs/getting-started.md)
- [CLI usage](./docs/cli-usage.md)
- [MCP setup](./docs/mcp-setup.md)
- [Command reference](./docs/command-reference.md)
- [Examples](./docs/examples.md)
- [Safe data policy](./docs/safe-data-policy.md)
- [Client smoke tests](./docs/client-smoke-tests.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Publishing notes](./docs/publishing.md)
- [Post-publish checklist](./docs/post-publish-checklist.md)

## Project Status

Current status: Master of SEO includes 18 SEO skill groups covering website audits, technical SEO, performance, on-page SEO, keyword research, content planning, schema, media, ecommerce, local/international SEO, AI Search readiness, trust/security/accessibility, CMS/framework SEO, competitor analysis, strategy, reporting, and governance.

Next step: npm release preparation, publish validation, and MCP compatibility checks in target agent clients.

## License

MIT License.
