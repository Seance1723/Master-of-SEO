# Group 2: Technical SEO

## Purpose

Provide a safe Technical SEO audit pack that checks only supplied inputs and never invents crawl results.

## Included Modules

- Search Essentials
- Spam Policy Compliance
- Crawlability
- Indexability
- Robots.txt
- Meta Robots
- X-Robots-Tag
- XML Sitemap
- URL Structure
- Canonicalization
- Redirects
- HTTP Status Codes

## Activation Command

Use `/seo-master technical-audit`.

## Input Requirements

Accept any available subset of `url`, `html`, `robotsTxt`, `sitemapXml`, `headers`, `statusCode`, `canonicalUrl`, `links`, `pages`, `framework`, and `mode`.

If no useful input is supplied, return `needs_input` with safe next actions.

## Output Format

Return `TechnicalAuditOutput` with status, score, summary, issues, passed checks, missing inputs, and next actions.

## Do

- Use evidence only from provided inputs.
- Categorize issues as P0, P1, P2, or P3.
- Return missing inputs clearly.
- Keep `/seo-master` trigger gating intact.
- Keep `/seo-master technical-audit` active.

## Don't

- Do not crawl or fetch live pages.
- Do not hallucinate robots, sitemap, status, or canonical results.
- Do not activate planned modules.

## Technical Rules

Use the Group 2 rule JSON files under `src/data`.

## MCP Behavior

`seo_master_run` must use the shared orchestrator and trigger rules. `seo_master_technical_audit` may directly run the technical audit only with explicit input.

## Memory Update Rule

After completion, mark Group 2 completed and set Group 3 Performance SEO as next.
