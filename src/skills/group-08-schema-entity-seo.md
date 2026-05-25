# Group 8: Schema & Entity SEO

## Purpose

Audit and generate safe structured data from provided page, entity, and JSON-LD inputs.

## Included Modules

- Schema Selection Skill
- Schema Validation Skill
- Rich Result Eligibility Skill
- Entity SEO Skill
- Organization, WebSite, BreadcrumbList, Article, Product, Service, SoftwareApplication, LocalBusiness, FAQPage, VideoObject, and JobPosting schema skills
- sameAs / Entity Relationship Skill
- Schema Recommendation Engine

## Do's

- Do use JSON-LD.
- Do choose schema based on actual page type.
- Do match schema to visible content.
- Do use real organization, author, product, service, local business, video, and job data.
- Do connect entities consistently with real sameAs URLs.

## Don'ts

- Don't perform live validation unless validator support is added later.
- Don't invent schema fields.
- Don't create fake reviews, fake ratings, fake authors, fake locations, or fake opening hours.
- Don't mark up hidden or misleading content.
- Don't promise rich results.

## Activation Commands

- `/seo-master schema-audit`
- `/seo-master schema-generate`

## Input Requirements

Accept HTML, JSON-LD, page data, organization data, author data, product/service/software/local business/video/job data, and mode. If no usable input is provided, return `needs_input`.

## Output Format

Return a `schema-entity-seo` report with status, score, detected schemas, recommended schemas, generated JSON-LD, entity findings, rich result eligibility, issues, missing inputs, and next actions.

## Schema Rules

Schema must be accurate, syntactically valid, and aligned with visible page content.

## Entity SEO Rules

Entity names, URLs, sameAs profiles, publishers, authors, products, and services must be consistent and real.

## Rich Result Caution

Valid schema can be eligible for rich results, but eligibility never guarantees display.

## FAQ Schema Caution

FAQPage schema is generated only when visible FAQ content is provided. FAQ rich-result visibility is limited and should not be overpromised.

## MCP Behavior

MCP tools must call the same schema audit/generation logic. `seo_master_run` must respect `/seo-master`; direct schema tools require explicit input.

## Memory Update Rule

After Group 8, mark the group complete, set Group 9 as next, update README, and add a task log entry.
