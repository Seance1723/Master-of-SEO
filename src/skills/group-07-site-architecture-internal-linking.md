# Group 7: Site Architecture & Internal Linking

## Purpose

Implement safe, input-driven site architecture and internal linking audits for Master of SEO.

## Included Modules

- Site Architecture Skill
- URL Hierarchy Skill
- Navigation Structure Skill
- Crawl Depth Skill
- Orphan Page Detection Skill
- Internal Linking Skill
- Anchor Text Quality Skill
- Breadcrumb Skill
- Topic Cluster Linking Skill
- Link Equity Distribution Skill
- Internal Linking Recommendation Engine

## Do's

- Do use only provided pages, links, navigation, breadcrumbs, sitemap URLs, and topic clusters.
- Do normalize URLs for comparison while preserving display URLs.
- Do flag orphan pages, deep important pages, weak contextual links, generic anchors, missing breadcrumbs, and weak cluster links.
- Do keep important commercial pages close to the homepage and linked contextually.
- Do recommend practical internal linking and breadcrumb improvements.

## Don'ts

- Don't perform live crawling unless crawler support is added later.
- Don't invent crawl depth, orphan pages, link counts, or sitemap coverage.
- Don't assume sitemap inclusion replaces internal links.
- Don't nofollow normal internal links.
- Don't create random links without topical or user value.

## Activation Commands

- `/seo-master architecture-audit`
- `/seo-master internal-linking-audit`

## Input Requirements

Accept pages, links, navigation, breadcrumbs, sitemapUrls, topicClusters, URL, and mode. If no usable input is provided, return `needs_input`.

## Output Format

Return a structured `site-architecture-internal-linking` report with status, score, findings, orphan pages, crawl depth issues, anchor text issues, breadcrumb issues, topic cluster linking issues, recommendations, issues, missing inputs, and next actions.

## Site Architecture Rules

Keep important pages close to the homepage, group related content logically, make commercial pages easy to reach, and avoid disconnected or deeply buried pages.

## Internal Linking Rules

Use descriptive, followed contextual links. Connect informational pages to commercial pages, supporting pages to pillar pages, and related pages naturally.

## Breadcrumb Rules

Use crawlable breadcrumbs for hierarchical templates and keep the path aligned with the canonical URL hierarchy.

## Topic Cluster Linking Rules

Connect pillar pages, supporting pages, and commercial destinations. Avoid clusters that exist only as a list without real internal links.

## MCP Behavior

MCP tools must call the same architecture audit logic. `seo_master_run` must still respect `/seo-master`; direct architecture tools require explicit input and must not crawl.

## Memory Update Rule

After Group 7, mark the group complete, set Group 8 as next, update README, and add a task log entry.
