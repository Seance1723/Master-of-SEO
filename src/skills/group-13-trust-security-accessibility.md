# Group 13: Trust, Security & Accessibility

## Purpose
Audit trust, E-E-A-T, security, legal policy, and accessibility readiness from provided inputs only.

## Included Modules
- Trust SEO audit
- E-E-A-T audit
- Author and reviewer trust
- Organization trust
- Contact transparency
- Trust pages
- Testimonial/review authenticity guard
- Legal policy readiness
- Security SEO audit
- HTTPS/mixed content guard
- Malware/hacked content guard
- Form trust and safety
- Accessibility SEO audit
- Semantic HTML
- Heading accessibility
- Image alt accessibility
- Form accessibility
- Keyboard navigation
- Contrast/readability

## Do
- Show real organization, author, reviewer, contact, policy, and proof signals.
- Use HTTPS, secure forms, and safe resource URLs.
- Label fields, use accessible names, meaningful alt text, semantic structure, and logical headings.

## Don't
- Do not invent company details, authors, testimonials, policies, security status, or accessibility status.
- Do not perform live scans unless provider support is added later.
- Do not treat malware, hacked content, sensitive form, or keyboard trap signals as low priority.

## Activation Commands
- `/seo-master trust-audit`
- `/seo-master eeat-audit`
- `/seo-master security-audit`
- `/seo-master accessibility-audit`

## Input Requirements
Use provided HTML, page data, organization data, authors, reviewers, trust pages, testimonials, case studies, headers, resources, forms, headings, images, links, buttons, and manual signals.

## Output Format
Return `trust-security-accessibility` output with findings, issues, missing inputs, next actions, score, and status.

## MCP Behavior
MCP tools call the same audit logic and do not perform live scanning or external validation.

## Memory Update
After Group 13, update memory, README, command registry, tests, and next group.
