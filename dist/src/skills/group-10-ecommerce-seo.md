# Group 10: Ecommerce SEO

## Purpose

Audit ecommerce product, category, variant, faceted navigation, pagination, trust policy, merchant feed, and internal linking inputs without live fetching.

## Included Modules

- Ecommerce SEO Audit Skill
- Ecommerce Category SEO Skill
- Product SEO Skill
- Product Variant SEO Skill
- Product Review & Rating Guard
- Product Schema Guard
- Category Content Quality Skill
- Faceted Navigation SEO Skill
- Filter / Parameter SEO Skill
- Pagination SEO Skill
- Out-of-Stock / Discontinued Product Handling Skill
- Ecommerce Internal Linking Skill
- Ecommerce Trust Policy Skill
- Merchant Feed Readiness Skill
- Ecommerce Recommendation Engine

## Do's

- Do use only provided product, category, variant, filter, pagination, schema, review, page, policy, feed, and link inputs.
- Do keep commercial pages crawlable and indexable when valuable.
- Do show accurate product data, availability, trust, shipping, return, contact, and payment information.
- Do control low-value filters and parameters.
- Do handle out-of-stock and discontinued products safely.

## Don'ts

- Don't fetch live products, prices, stock, reviews, Merchant Center, or ecommerce API data.
- Don't invent product prices, reviews, ratings, availability, stock status, shipping, returns, or feed data.
- Don't index cart, checkout, account, internal search, or low-value filters.
- Don't fake reviews or ratings.

## Activation Commands

- `/seo-master ecommerce-seo`
- `/seo-master ecommerce-audit`
- `/seo-master product-seo-audit`
- `/seo-master category-seo-audit`

## Input Requirements

Accept HTML, page, categories, products, filters, pagination, policies, merchantFeed, internalLinks, and mode. Return `needs_input` when no usable input is supplied.

## Output Format

Return an `ecommerce-seo` report with status, score, category findings, product findings, variant findings, faceted navigation findings, pagination findings, trust findings, merchant feed findings, issues, missing inputs, and next actions.

## Ecommerce Rules

Optimize product, category, collection, and low-value commerce pages separately.

## Category SEO Rules

Index useful categories with products, crawlable links, unique content, and safe pagination.

## Product SEO Rules

Use accurate visible product name, description, images, price, availability, brand, SKU, and genuine reviews.

## Variant Rules

Define whether variants should self-index, canonicalize, redirect, or consolidate.

## Faceted Navigation Rules

Index only valuable filter combinations and suppress sort/order/session/low-value parameter URLs.

## Pagination Rules

Keep product discovery crawlable beyond page 1.

## Out-of-Stock/Discontinued Rules

Use accurate availability, alternatives, redirects, noindex, or 410 handling based on provided status.

## Ecommerce Trust Rules

Include shipping, returns, privacy, terms, contact, and payment security signals.

## Merchant Feed Readiness Rules

Keep feed price, image, currency, availability, and identifiers aligned with visible product data.

## MCP Behavior

MCP tools call the same ecommerce audit logic. `seo_master_run` respects `/seo-master`; direct ecommerce tools require explicit input.

## Memory Update Rule

After Group 10, mark the group complete, set Group 11 as next, update README, and add a task log entry.
