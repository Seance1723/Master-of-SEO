# Group 6: Content Strategy & Planning

## Purpose

Provide safe content strategy, topic cluster, brief, gap, refresh, pruning, calendar, and quality planning from supplied inputs only.

## Included Modules

- Content Planning
- Topic Cluster
- Pillar Page Planning
- Supporting Content Planning
- Content Brief Generator
- Content Gap Mapping
- Content Refresh
- Content Pruning
- Content Calendar
- Content Quality Guard
- Content Recommendation Engine

## Activation Command

Use `/seo-master content-plan`.

## Input Requirements

Accept business context, keyword clusters, existing pages, competitor pages, and constraints. If no useful input is supplied, return `needs_input`.

## Output Format

Return `ContentPlanOutput` with pillar pages, supporting pages, briefs, gaps, refresh/pruning plans, calendar, issues, missing inputs, and next actions.

## Do

- Use only supplied inputs.
- Prioritize BOFU and high-business-value content.
- Connect TOFU content to commercial pages.
- Include internal linking and CTA instructions.

## Don't

- Do not fetch live SERP, traffic, competitor, or keyword metric data.
- Do not invent traffic, conversions, or competitor results.
- Do not create random blogs without intent.

## Content Planning Rules

Use the Group 6 rule JSON files under `src/data`.

## Topic Cluster Rules

Plan one strong pillar per major topic with supporting content and internal links.

## Content Brief Rules

Include target keyword, intent, audience, outline, FAQs, links, CTA, schema, quality notes, and success metric.

## Refresh/Pruning Rules

Refresh useful outdated/thin pages. Prune safely with improve, merge, redirect, canonicalize, noindex, or delete recommendations.

## MCP Behavior

`seo_master_run` must use shared trigger rules. `seo_master_content_plan` may directly run content planning only with explicit input.

## Memory Update Rule

After completion, mark Group 6 completed and set Group 7 Site Architecture & Internal Linking as next.
