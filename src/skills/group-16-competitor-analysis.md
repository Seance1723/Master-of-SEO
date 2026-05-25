# Group 16: Competitor Analysis

## Purpose
Find strategic SEO opportunities from provided competitor evidence without live fetching or invented metrics.

## Included Modules
- Competitor analysis
- Competitor type detection
- SERP analysis
- Keyword gap
- Content gap
- Backlink gap
- Page structure comparison
- Metadata comparison
- Schema comparison
- Internal linking signals
- UX/conversion signals
- SERP feature opportunities
- Positioning analysis
- Opportunity prioritization
- Report generation

## Do's
- Separate direct competitors from search competitors.
- Compare intent, page type, content, metadata, schema, backlinks, and conversion messaging.
- Use competitor data to find gaps, not to copy.
- Prioritize by business value, funnel stage, feasibility, and evidence.

## Don'ts
- Do not perform live crawling, SERP scraping, backlink fetching, keyword API calls, traffic estimation, or competitor discovery.
- Do not invent competitor rankings, traffic, backlinks, keyword volume, SERP features, domain authority, or content performance.
- Do not copy competitor content or recommend spammy tactics.

## Activation Commands
- `/seo-master competitor-analysis`
- `/seo-master competitor-audit`
- `/seo-master competitor-keyword-gap`
- `/seo-master competitor-content-gap`
- `/seo-master competitor-backlink-gap`
- `/seo-master serp-analysis`

## Input Requirements
Accept business context, own-site page/keyword data, competitor pages, competitor keywords, competitor backlinks, competitor SERP features, and SERP data.

## Output Format
Return a `competitor-analysis` report with competitor types, SERP findings, keyword gaps, content gaps, backlink gaps, page structure findings, metadata/schema findings, UX/conversion findings, SERP feature opportunities, positioning findings, opportunities, issues, missing inputs, and next actions.

## Competitor Type Rules
Preserve provided competitor type. Infer search/content/local/product/marketplace/direct roles only from provided evidence.

## SERP Analysis Rules
Use provided top results and features to detect dominant page type and safe SERP feature opportunities.

## Keyword Gap Rules
Compare competitor keyword inputs with own-site ranking and target keyword inputs. Do not invent rank, volume, or difficulty.

## Content Gap Rules
Compare target keywords, page types, headings, sections, FAQs, proof, and CTAs. Recommend differentiation, not copying.

## Backlink Gap Rules
Use provided backlinks only. Ignore spam links and prioritize relevant editorial, partner, resource, and PR sources.

## Page Structure Rules
Use structure as evidence of user needs, not a template to copy.

## Metadata/Schema Comparison Rules
Recommend original metadata and valid schema only. Never add fake reviews or ratings.

## UX/Conversion Comparison Rules
Flag missing CTA/conversion evidence when competitors show clear CTA paths and the business goal is commercial.

## Opportunity Prioritization Rules
Prioritize commercial, BOFU, evidence-backed, feasible opportunities.

## MCP Behavior
MCP tools must call the same competitor logic and must not hallucinate rankings, traffic, backlinks, SERP features, keyword volume, or competitor metrics.

## Memory Update Rule
After implementation, mark Group 16 completed and set Group 17 SEO Strategy & Campaign Planning as next.
