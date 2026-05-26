# Group 12: AI Search & Discover SEO

## Purpose
Assess AI Search and Discover readiness from provided inputs only.

## Included Modules
- AI Search readiness
- Generative search content
- Answer blocks
- Conversational query coverage
- Snippet eligibility
- Entity clarity
- Information gain
- Source/citation quality
- Content extractability
- AI-generated content quality guard
- Google Discover readiness
- News/publisher readiness
- Large image preview guard
- Discover title/thumbnail guard

## Do
- Keep valuable pages indexable and snippet-eligible.
- Add concise answer blocks, clear headings, examples, sources, and original insight.
- Define real entities and use valid sameAs URLs.
- Use honest titles, high-quality images, publisher identity, author details, and accurate dates.

## Don't
- Do not promise AI Overview, Discover, SERP, snippet, ranking, or rich-result visibility.
- Do not invent sources, entities, images, publisher data, or visibility checks.
- Do not use clickbait, misleading thumbnails, fake freshness, or generic AI filler.

## Activation Commands
- `/seo-master ai-search-readiness`
- `/seo-master ai-search-audit`
- `/seo-master answer-block-audit`
- `/seo-master discover-seo-audit`
- `/seo-master ai-content-quality-audit`

## Input Requirements
Use provided HTML, page data, content, entities, queries, schema, publisher, images, Open Graph, and content signals.

## Output Format
Return `ai-search-discover-seo` output with findings, issues, missing inputs, next actions, score, and status.

## Rules
Follow AI Search readiness, answer block, conversational query, snippet eligibility, entity clarity, information gain, citation quality, AI content quality, Discover, news/publisher, and large image preview guardrails.

## MCP Behavior
MCP tools call the same audit logic and do not perform live provider checks.

## Memory Update
After Group 12, update memory, README, command registry, tests, and next group.
