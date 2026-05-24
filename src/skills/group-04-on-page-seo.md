# Group 4: On-Page SEO

## Purpose

Provide a safe On-Page SEO audit pack that checks only supplied HTML and structured on-page inputs.

## Included Modules

- Title Tag
- Meta Description
- Heading Structure
- H1-H6 Hierarchy
- Content Structure
- Above-the-Fold SEO
- CTA & Conversion SEO
- Internal On-Page Link Check
- Image Alt Text Check
- On-Page SEO Recommendation Engine

## Activation Command

Use `/seo-master on-page-audit`.

## Input Requirements

Accept any available subset of `url`, `html`, `title`, `metaDescription`, `h1`, `headings`, `bodyText`, `images`, `links`, `ctas`, `pageType`, `primaryKeyword`, `secondaryKeywords`, and `mode`.

If no useful input is supplied, return `needs_input` with safe next actions.

## Output Format

Return `OnPageAuditOutput` with status, score, summary, issues, passed checks, missing inputs, and next actions.

## Do

- Use explicit inputs first and HTML extraction second.
- Use evidence only from supplied inputs.
- Categorize issues as P0, P1, P2, or P3.
- Keep `/seo-master` trigger gating intact.
- Keep `/seo-master on-page-audit` active.

## Don't

- Do not fetch live pages.
- Do not hallucinate title, copy, headings, links, CTAs, or images.
- Do not activate planned modules.

## On-Page Rules

Use the Group 4 rule JSON files under `src/data`.

## MCP Behavior

`seo_master_run` must use the shared orchestrator and trigger rules. `seo_master_on_page_audit` may directly run the on-page audit only with explicit input.

## Memory Update Rule

After completion, mark Group 4 completed and set Group 5 Keyword Research & Intent as next.
