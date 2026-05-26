# Group 3: Performance SEO

## Purpose

Provide a safe Performance SEO audit pack that checks only supplied metrics, HTML, headers, and asset data.

## Included Modules

- Core Web Vitals
- LCP
- INP
- CLS
- TTFB
- Asset Optimization
- Image Performance
- Font Performance
- JavaScript Performance
- CSS Performance
- Third-Party Script Performance
- Performance Recommendation Engine

## Activation Command

Use `/seo-master performance-audit`.

## Input Requirements

Accept any available subset of `url`, `html`, `headers`, `assets`, `metrics`, `framework`, and `mode`.

If no useful input is supplied, return `needs_input` with safe next actions.

## Output Format

Return `PerformanceAuditOutput` with status, score, summary, metrics, issues, passed checks, missing inputs, and next actions.

## Do

- Use evidence only from supplied inputs.
- Categorize issues as P0, P1, P2, or P3.
- Prioritize Core Web Vitals and critical rendering.
- Keep `/seo-master` trigger gating intact.
- Keep `/seo-master performance-audit` active.

## Don't

- Do not run Lighthouse or fetch live pages.
- Do not hallucinate field data, lab scores, or asset sizes.
- Do not activate planned modules.

## Performance Rules

Use the Group 3 rule JSON files under `src/data`.

## MCP Behavior

`seo_master_run` must use the shared orchestrator and trigger rules. `seo_master_performance_audit` may directly run the performance audit only with explicit input.

## Memory Update Rule

After completion, mark Group 3 completed and set Group 4 On-Page SEO as next.
