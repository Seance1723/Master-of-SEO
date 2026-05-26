# Group 17: SEO Strategy & Campaign Planning

## Purpose
Turn provided audit, keyword, content, competitor, business, resource, launch, and migration inputs into an SEO strategy and campaign roadmap.

## Included Modules
- SEO strategy
- SEO plan generator
- Campaign planning
- Goal mapping and business goal mapping
- Opportunity prioritization
- Impact-effort matrix
- 30/60/90 roadmap
- Technical, content, authority, and conversion roadmaps
- Launch checklist
- Migration plan
- Resource and capacity planning
- SEO risk planning
- Strategy report generation

## Do's
- Start with business goals.
- Prioritize P0/P1 blockers, BOFU opportunities, and high-impact low-effort work.
- Respect resources and dependencies.
- Sequence launch and migration risk before growth tasks.

## Don'ts
- Do not fetch live crawling, keyword, competitor, Search Console, GA4, backlink, ranking, launch, or migration data.
- Do not invent rankings, traffic, revenue, keyword volume, backlinks, conversions, campaign results, launch status, or migration data.
- Do not promise rankings, traffic, or revenue.

## Activation Commands
- `/seo-master seo-plan`
- `/seo-master seo-strategy`
- `/seo-master seo-campaign-plan`
- `/seo-master opportunity-plan`
- `/seo-master launch-checklist`
- `/seo-master migration-plan`

## Input Requirements
Business, website audit, keyword research, content plan, competitor analysis, resources, constraints, launch, or migration inputs.

## Output Format
Return `seo-strategy-campaign-planning` with goals, prioritized opportunities, impact-effort matrix, roadmap, technical/content/authority/conversion plans, launch checklist, migration plan, resource plan, risks, issues, missing inputs, and next actions.

## SEO Strategy Rules
Connect SEO work to business outcomes and avoid traffic-only planning.

## Goal Mapping Rules
Map ecommerce to sales, SaaS to demos/signups, local to local visits/leads, and content sites to authority/traffic readiness.

## Opportunity Prioritization Rules
P0/P1 first, BOFU before TOFU, technical blockers before content scaling.

## Impact-Effort Rules
Classify quick wins, strategic projects, incremental work, and deprioritized items.

## 30/60/90 Roadmap Rules
Sequence blockers and dependencies before growth and optional polish.

## Launch Checklist Rules
Check noindex, robots, sitemap, canonicals, redirects, analytics, Search Console, schema, performance, forms, and templates.

## Migration Plan Rules
Require old/new URL mapping, redirect review, backups, high-value page preservation, testing, and monitoring.

## Resource Planning Rules
Match roadmap load to monthly content, developer, SEO, and design capacity.

## SEO Risk Rules
Flag missing goals, measurement gaps, unresolved blockers, launch/migration risk, content imbalance, low capacity, and unknown data.

## MCP Behavior
MCP tools call the same strategy logic and must not hallucinate provider data or metrics.

## Memory Update Rule
After implementation, mark Group 17 completed and set Group 18 Measurement, Reporting & Governance as next.
