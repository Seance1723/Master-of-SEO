# Group 5: Keyword Research & Intent

## Purpose

Provide safe keyword research, intent detection, clustering, mapping, cannibalization checks, and prioritization from supplied inputs only.

## Included Modules

- Keyword Research
- Keyword Clustering
- Search Intent
- Keyword Difficulty & Intent Mapping
- Funnel Stage Mapping
- Keyword-to-Page Mapping
- Cannibalization Risk
- Keyword Opportunity Prioritization
- SERP Intent Assumption Guard
- Keyword Research Recommendation Engine

## Activation Command

Use `/seo-master keyword-research`.

## Input Requirements

Accept seed keywords, competitor keywords, existing pages, business context, and keyword metrics. If no useful input is supplied, return `needs_input`.

## Output Format

Return `KeywordResearchOutput` with clusters, issues, keyword map, cannibalization risks, opportunities, missing inputs, and next actions.

## Do

- Use only provided keyword inputs and metrics.
- Classify intent before recommending page type.
- Map keywords to funnel stage and page type.
- Flag uncertain SERP assumptions.
- Preserve `/seo-master` trigger gating.

## Don't

- Do not fetch live keyword volume, CPC, SERP, rankings, or difficulty.
- Do not invent metrics.
- Do not create page plans without mapping.

## Keyword Research Rules

Use the Group 5 rule JSON files under `src/data`.

## Intent Detection Rules

Use modifier-based classification and keep unknown intent when signals are weak.

## Keyword Mapping Rules

Map one main intent to one target page, update matching existing pages, and flag cannibalization.

## MCP Behavior

`seo_master_run` must use shared trigger rules. `seo_master_keyword_research` may directly run keyword logic only with explicit input.

## Memory Update Rule

After completion, mark Group 5 completed and set Group 6 Content Strategy & Planning as next.
