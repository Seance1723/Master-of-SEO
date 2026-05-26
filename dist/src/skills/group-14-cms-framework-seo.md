# Group 14: CMS & Framework SEO

## Purpose
Audit CMS and framework SEO readiness from provided inputs only.

## Included Modules
- CMS/framework SEO audit
- WordPress SEO
- WordPress permalinks
- WordPress archive and attachment indexing
- WordPress SEO plugin conflict guard
- WordPress theme performance guard
- React SEO
- Next.js SEO
- Static website SEO
- SPA SEO risk guard
- SSR/SSG readiness
- Dynamic metadata
- Route-level SEO
- Sitemap, robots, and canonical generation guards
- Open Graph/social metadata guard
- JSON-LD rendering guard
- Framework build validation

## Do
- Identify CMS/framework before applying rules.
- Check route-level metadata, canonical, robots, sitemap, schema, rendering, and build output.
- Use WordPress, React, Next.js, and static-site-specific checks.

## Don't
- Do not invent framework versions, plugin status, build results, route behavior, CMS config, or deployment status.
- Do not run live builds, CMS scans, plugin scans, or crawling.
- Do not assume client-side rendering or framework defaults are SEO-safe.

## Activation Commands
- `/seo-master framework-seo-audit`
- `/seo-master wordpress-seo-audit`
- `/seo-master react-seo-audit`
- `/seo-master nextjs-seo-audit`
- `/seo-master static-seo-audit`
- `/seo-master build-seo-check`

## Input Requirements
Use provided HTML, framework, CMS, package.json, framework config, routes, build output, and SEO files.

## Output Format
Return `cms-framework-seo` output with findings, issues, missing inputs, next actions, score, and status.

## MCP Behavior
MCP tools call the same audit logic and do not perform live CMS login, framework inspection, build execution, plugin scans, or crawling.

## Memory Update
After Group 14, update memory, README, command registry, tests, and next group.
