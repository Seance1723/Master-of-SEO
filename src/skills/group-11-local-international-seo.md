# Group 11: Local & International SEO

## Purpose

Audit local SEO, Google Business Profile readiness, NAP consistency, local landing pages, reviews, citations, service areas, multi-location SEO, international targeting, hreflang, x-default, and localized content quality from provided inputs only.

## Included Modules

- Local SEO Audit Skill
- Google Business Profile Readiness Skill
- NAP Consistency Skill
- Local Landing Page Skill
- LocalBusiness Schema Guard
- Review Quality & Authenticity Guard
- Local Citation Readiness Skill
- Service Area SEO Skill
- Multi-Location SEO Skill
- International SEO Audit Skill
- Hreflang Skill
- Language & Country Targeting Skill
- x-default Skill
- Localized Content Quality Skill
- International URL Structure Skill
- Local & International Recommendation Engine

## Do's

- Do use only provided business, location, GBP, citation, review, schema, hreflang, language, country, and localized content inputs.
- Do keep NAP consistent.
- Do create genuine local landing pages.
- Do use valid reciprocal hreflang.
- Do localize currency, units, examples, metadata, and CTAs where relevant.

## Don'ts

- Don't fetch live GBP, citations, maps, hreflang, language, or location data.
- Don't invent addresses, reviews, ratings, phone numbers, hours, service areas, or country/language targeting.
- Don't create fake office locations, doorway pages, or raw machine-translated pages.
- Don't canonical all localized pages to one version.

## Activation Commands

- `/seo-master local-seo`
- `/seo-master local-seo-audit`
- `/seo-master international-seo`
- `/seo-master international-seo-audit`
- `/seo-master hreflang-audit`

## Input Requirements

Accept local business, locations, pages, Google Business Profile, citations, reviews, site, international pages, hreflang sets, localized content, and mode. Return `needs_input` when no usable input is supplied.

## Output Format

Return a `local-international-seo` report with status, score, local findings, international findings, hreflang findings, NAP findings, local page findings, localized content findings, issues, missing inputs, and next actions.

## Local SEO Rules

Use real local presence, consistent NAP, genuine local pages, accurate service areas, and honest LocalBusiness schema.

## Google Business Profile Rules

GBP fields must match real business details and avoid keyword stuffing or fake categories/addresses.

## NAP Rules

Compare website, GBP, locations, and citations for consistent name, address, and phone.

## Local Landing Page Rules

Local pages should be unique, useful, location-specific, and not doorway city pages.

## Review Rules

Reviews must be genuine, visible, and valid; do not infer fake reviews without evidence.

## International SEO Rules

Use clear language/country targets, URL strategy, canonicals, and localization.

## Hreflang Rules

Use valid language-country codes, self-references, return tags, and indexable canonical URLs.

## x-default Rules

Use x-default for global selector or fallback pages where useful.

## Localized Content Rules

Localized content should be native-quality and adapted for region-specific expectations.

## MCP Behavior

MCP tools call the same audit logic. `seo_master_run` respects `/seo-master`; direct local/international tools require explicit input.

## Memory Update Rule

After Group 11, mark the group complete, set Group 12 as next, update README, and add a task log entry.
