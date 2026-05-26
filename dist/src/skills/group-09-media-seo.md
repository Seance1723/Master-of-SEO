# Group 9: Media SEO

## Purpose

Audit image, video, Open Graph, schema, accessibility, and media performance inputs without live crawling or fetching.

## Included Modules

- Media SEO Audit Skill
- Image SEO, alt text, filename, format, compression, responsive image, Open Graph, and image sitemap recommendation skills
- Video SEO, transcript, caption, thumbnail, VideoObject schema, and video sitemap recommendation skills
- Media Accessibility Skill
- Media Performance Guard
- Media Recommendation Engine

## Do's

- Do use only provided HTML, media arrays, Open Graph, schema, asset, and manual inputs.
- Do write useful alt text for meaningful images.
- Do leave decorative image alt empty when appropriate.
- Do compress media, define dimensions, and avoid lazy-loading hero images.
- Do provide transcripts, captions, thumbnails, and VideoObject data when available.

## Don'ts

- Don't crawl, fetch media, run OCR, or validate external media.
- Don't hallucinate image sizes, formats, alt text, thumbnails, transcripts, or video metadata.
- Don't keyword-stuff alt text.
- Don't invent video dates, durations, or thumbnails.
- Don't autoplay video with sound.

## Activation Commands

- `/seo-master media-audit`
- `/seo-master image-seo-audit`
- `/seo-master video-seo-audit`

## Input Requirements

Accept HTML, page data, images, videos, Open Graph data, schema JSON-LD, assets, and mode. Return `needs_input` when no usable input is supplied.

## Output Format

Return a `media-seo` report with status, score, image findings, video findings, accessibility findings, performance findings, schema findings, issues, missing inputs, and next actions.

## Image SEO Rules

Images should be relevant, compressed, responsive, dimensioned, and accessible. Hero images should not be lazy-loaded.

## Video SEO Rules

Videos should have titles, descriptions, thumbnails, transcripts, captions, surrounding text, and VideoObject schema when data is available.

## Media Accessibility Rules

Use alt text, captions, transcripts, accessible controls, and avoid autoplay with sound.

## Media Performance Rules

Guard LCP and CLS by compressing media, defining dimensions, deferring below-fold embeds, and avoiding heavy above-fold video.

## MCP Behavior

MCP tools call the same media audit logic. `seo_master_run` respects `/seo-master`; direct tools require explicit input.

## Memory Update Rule

After Group 9, mark the group complete, set Group 10 as next, update README, and add a task log entry.
