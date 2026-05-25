# Group 7 Prompt: Site Architecture & Internal Linking

Use `/seo-master architecture-audit` or `/seo-master internal-linking-audit` to audit provided site architecture and link data.

Accept only explicit inputs: pages, links, navigation, breadcrumbs, sitemap URLs, and topic clusters. Do not crawl or invent link graph data.

Return orphan page findings, crawl depth approximations, navigation issues, internal link issues, anchor text quality issues, breadcrumb issues, topic cluster linking issues, link equity recommendations, missing inputs, and next actions.

If no usable input is provided, return `needs_input` and ask for page, link, navigation, breadcrumb, sitemap, or topic cluster data.
