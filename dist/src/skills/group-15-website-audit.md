# Group 15: Website Audit

## Purpose
Aggregate the implemented SEO skill packs into a full website audit using provided inputs only.

## Included Modules
- Full website audit
- Page-level audit
- Template-level audit
- Technical, performance, on-page, content, architecture, schema, media, ecommerce, local/international, AI Discover, trust/security/accessibility, and CMS/framework aggregators
- Issue deduplication
- Priority normalization
- Website score
- Audit roadmap
- Report generation

## Do's
- Use only provided evidence.
- Identify website type and business goal before scoring.
- Run only relevant modules.
- Deduplicate repeated issues.
- Normalize P0/P1/P2/P3 priorities.
- Exclude non-applicable categories from final scoring.
- Produce quick wins, strategic opportunities, and a 7/30/60/90-day roadmap.

## Don'ts
- Do not perform live crawling, scraping, Lighthouse runs, Search Console reads, GA4 reads, backlink checks, keyword API calls, or external validation.
- Do not invent crawl results, rankings, traffic, conversions, Core Web Vitals, backlinks, schema validation results, security status, or analytics data.
- Do not recommend ecommerce/local/international work when not applicable.

## Activation Commands
- `/seo-master audit-website`
- `/seo-master website-audit`
- `/seo-master full-audit`
- `/seo-master page-audit`

## Input Requirements
Accept website, pages, technical, performance, on-page, keyword, content, architecture, schema, media, ecommerce, local/international, AI Discover, trust/security/accessibility, CMS/framework, and manual audit inputs.

## Output Format
Return a `website-audit` report with category scores, critical issues, quick wins, strategic opportunities, page findings, template findings, deduplicated issues, roadmap, missing inputs, and next actions.

## Audit Aggregation Rules
Run modules only when relevant data is available. A URL alone is not enough to crawl or audit live.

## Page-Level Audit Rules
Flag page-specific blockers such as missing title, meta description, H1, canonical, or important noindex signals from provided page inputs.

## Template-Level Audit Rules
Group repeated issues by page type and recommend fixing template issues at the source.

## Deduplication Rules
Deduplicate by issue identity, category, source skill, title, evidence, affected page, and template.

## Priority Normalization Rules
Promote sitewide indexing, security, build, and critical ecommerce/local blockers. Demote low-evidence optimization suggestions.

## Score Rules
Calculate category scores from issues. Re-normalize weights when categories are not applicable.

## Roadmap Rules
P0 goes into first 7 days, P1 into first 30 days, P2 into days 31-60, and strategic work into days 61-90.

## MCP Behavior
MCP tools must call the same website audit logic and must not perform live fetching or hallucinate audit data.

## Memory Update Rule
After implementation, mark Group 15 completed and set Group 16 Competitor Analysis as next.
