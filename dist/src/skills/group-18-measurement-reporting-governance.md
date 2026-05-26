# Group 18: Measurement, Reporting & Governance

## Purpose
Generate evidence-based SEO measurement, reporting, governance, QA, release guard, changelog, and final status outputs from provided inputs only.

## Included Modules
- SEO measurement
- KPI mapping
- Search Console diagnostics
- GA4 organic conversion checks
- Analytics event mapping
- Organic traffic and conversion measurement
- Keyword performance
- Content decay
- Core Web Vitals measurement
- Backlink measurement
- Revenue and pipeline attribution
- SEO report generation
- Executive summary generation
- Roadmap progress tracking
- SEO governance
- SEO QA checklist
- Release SEO guard
- SEO changelog
- Final Master of SEO report

## Do's
- Measure business impact, not only rankings.
- Map KPIs to website type and goals.
- Report missing data clearly.
- Use previous-period comparisons only when provided.
- Keep releases behind SEO QA and changelog governance.

## Don'ts
- Do not fetch live Search Console, GA4, rankings, backlinks, revenue, or provider data.
- Do not invent clicks, impressions, CTR, rankings, conversions, revenue, backlinks, Core Web Vitals, or traffic.
- Do not promise traffic, revenue, rankings, or reporting outcomes.

## Activation Commands
- `/seo-master report`
- `/seo-master seo-report`
- `/seo-master measurement-report`
- `/seo-master governance-check`
- `/seo-master seo-qa`
- `/seo-master release-seo-check`
- `/seo-master memory`
- `/seo-master final-status`

## Input Requirements
Accepts optional business, website audit, SEO strategy, Search Console-style, GA4-style, rank tracking, Core Web Vitals, backlink, content performance, and governance inputs. `seo-qa` may return a generic checklist without input.

## Output Format
Returns `measurement-reporting-governance` output with score, summary, executive summary, KPIs, findings, QA checklist, release risks, roadmap progress, final report, issues, missing inputs, and next actions.

## Measurement Rules
Use provided metrics only. Find high-impression low-CTR opportunities, page-2 opportunities, low-conversion landing pages, content decay, CWV issues, backlink risks, and missing attribution setup.

## KPI Mapping Rules
Map SaaS, ecommerce, local, blog/news, documentation, and general websites to relevant KPI groups.

## Search Console Rules
Analyze clicks, impressions, CTR, average position, pages, queries, and indexing only when provided.

## GA4 Rules
Analyze organic sessions, users, conversions, events, conversion rate, revenue, and landing pages only when provided.

## Content Decay Rules
Flag decay only when previous clicks or sessions are at least 20 percent higher than current values.

## Reporting Rules
Include executive summary, KPI snapshot, top issues, risks, missing data, and next actions. Avoid raw dumps and unsupported claims.

## Governance Rules
Check SEO QA process, release checklist, redirect policy, content update process, analytics review cadence, and changelog process.

## SEO QA Rules
Generate checks for metadata, headings, canonical, robots, sitemap, redirects, schema, CWV, mobile, accessibility, forms, analytics, Search Console, Open Graph, trust/legal pages, 404 page, and template QA.

## Release SEO Guard Rules
Flag high-risk URL, template, robots, sitemap, migration, and redesign changes. Block or require review when P0/P1 risks are present.

## Final Report Rules
Combine audit, strategy, measurement, and governance into current status, KPI health, issues, roadmap, risks, governance checklist, next actions, and missing data.

## MCP Behavior
MCP tools call the same reporting/governance logic. `seo_master_run` respects `/seo-master` trigger rules. Direct tools require explicit input except the QA checklist.

## Memory Update Rule
After implementation, mark Group 18 completed and move activeGroup to final packaging.

