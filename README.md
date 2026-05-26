# Master of SEO

An AI-agent SEO skill that turns any coding assistant into a technical SEO auditor, strategist, and website optimization partner.

Master of SEO helps AI agents audit websites, review code, plan keyword strategy, analyze competitors, generate SEO roadmaps, and protect SEO during launches and migrations. It is built for CLI workflows, MCP-compatible assistants, and npm-based developer environments.

[![npm](https://img.shields.io/badge/npm-master--of--seo-cb3837?style=flat-square)](https://www.npmjs.com/package/master-of-seo)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)
[![MCP Ready](https://img.shields.io/badge/MCP-ready-blue?style=flat-square)](#mcp-usage)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![AI Agent Skill](https://img.shields.io/badge/AI%20Agent-skill-7c3aed?style=flat-square)](#why-master-of-seo)
[![CLI Ready](https://img.shields.io/badge/CLI-ready-111827?style=flat-square)](#cli-usage)

## Why Master of SEO?

Most AI agents can write code.  
Master of SEO teaches them how to think like an SEO architect.

It gives AI assistants structured SEO judgment across technical SEO, on-page SEO, keyword research, competitor analysis, website audits, schema/entity SEO, performance SEO, ecommerce SEO, local/international SEO, AI Search readiness, launch/migration protection, reporting, and governance.

Safe by default: Master of SEO works from provided inputs unless live provider integrations are added later. It does not invent crawl results, Search Console metrics, GA4 data, rankings, backlinks, keyword volume, revenue, or traffic.

## What It Can Do

| Capability | What it helps with |
|---|---|
| Website Audit | Find technical, content, schema, UX, performance, and trust issues |
| Technical SEO | Robots, sitemap, canonical, redirects, status codes, indexing |
| Keyword Research | Cluster keywords, map intent, detect cannibalization |
| Competitor Analysis | Find keyword gaps, content gaps, backlink gaps, SERP opportunities |
| Content Planning | Build topic clusters, briefs, refresh plans, pruning plans |
| Schema SEO | Audit and generate safe JSON-LD |
| Performance SEO | Core Web Vitals, image, JS, CSS, font, third-party script checks |
| Ecommerce SEO | Product, category, variants, faceted navigation, reviews, Merchant feed readiness |
| Local & International SEO | NAP, local pages, GBP readiness, hreflang, localization |
| AI Search Readiness | Answer blocks, entity clarity, information gain, citation quality |
| Governance | SEO QA, release guard, reports, changelog, measurement |

## Installation

Install globally for CLI usage:

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
```

Example with explicit input:

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

Trigger with a slash command:

```text
/seo-master audit-website
```

Or explicitly ask an agent to use it:

```text
Check what is wrong in my website and use seo-master skills.
```

Master of SEO does not silently run for every SEO-related prompt. It activates only when:

- The command starts with `/seo-master`
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

| Tool | Usage |
|---|---|
| Codex | Add Master of SEO as MCP server |
| Antigravity | Add MCP server config |
| Windsurf | Add MCP server config |
| VS Code | Add MCP server in workspace/user config |
| Cursor | Add MCP server config |
| Claude | Add MCP server config |
| Continue | Use MCP, CLI, or package import |

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
/seo-master competitor-analysis
/seo-master competitor-keyword-gap
/seo-master competitor-content-gap
/seo-master competitor-backlink-gap
/seo-master serp-analysis
/seo-master content-plan
/seo-master seo-plan
/seo-master seo-strategy
/seo-master seo-campaign-plan
/seo-master opportunity-plan
```

### Specialized SEO

```text
/seo-master ecommerce-seo
/seo-master product-seo-audit
/seo-master category-seo-audit
/seo-master local-seo
/seo-master international-seo
/seo-master hreflang-audit
/seo-master ai-search-readiness
/seo-master discover-seo-audit
/seo-master framework-seo-audit
/seo-master wordpress-seo-audit
/seo-master react-seo-audit
/seo-master nextjs-seo-audit
/seo-master static-seo-audit
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

- Built for AI agents, not just humans
- Rule-based SEO reasoning
- Do / Don't guardrails
- Priority scoring: `P0`, `P1`, `P2`, `P3`
- Works through CLI, MCP, and package import
- Safe by default: does not hallucinate live data
- Designed for npm distribution
- Useful for developers, SEO teams, content teams, and agencies

## Safe By Default

Master of SEO does not invent data. If live crawl, keyword, ranking, traffic, backlink, GA4, or Search Console data is not provided, it returns safe recommendations or asks for input.

Live crawling, Search Console reads, GA4 reads, SERP scraping, backlink checks, ranking checks, keyword API calls, and external validation require future provider integrations.

## Library Usage

```ts
import { runSeoMaster } from "master-of-seo";

const result = await runSeoMaster("/seo-master keyword-research technical seo, seo audit");
console.log(result);
```

## Project Status

Current status: All 18 skill groups implemented.  
Next: Final QA, npm publish, MCP compatibility testing.

## License

MIT License.

