import type { JsonObject, RichResultFinding, SchemaAuditInput, SchemaAuditOutput, SchemaIssue } from "../types/schema.ts";
import { generateSchemaJsonLd, parseSchemaInputFromText } from "./schema-generate.ts";
import { recommendSchemaTypes } from "./schema-selection.ts";
import { extractJsonLdFromHtml, getPrimaryType, getSchemaTypes, hasSchemaInput, hasVisibleReviewEvidence, isJsonObject, isUrl, makeSchemaIssue } from "./schema-utils.ts";

export { parseSchemaInputFromText };

export function runSchemaAudit(input: SchemaAuditInput): SchemaAuditOutput {
  const normalized: SchemaAuditInput = { ...input, mode: input.mode ?? "audit" };
  if (!hasSchemaInput(normalized)) return needsInput();
  const extracted = normalized.jsonLd?.length ? { jsonLd: normalized.jsonLd, issues: [] as SchemaIssue[] } : extractJsonLdFromHtml(normalized.html);
  const schemas = extracted.jsonLd;
  const detectedSchemas = getSchemaTypes(schemas);
  const recommendedSchemas = recommendSchemaTypes(normalized);
  const issues = [...extracted.issues, ...validateSchemas(schemas, normalized), ...validateProvidedEntities(normalized, schemas)];
  const generatedJsonLd = normalized.mode === "generate" ? generateSchemaJsonLd(normalized) : [];
  const richResultEligibility = buildRichResultEligibility(recommendedSchemas, detectedSchemas, issues);
  const entityFindings = buildEntityFindings(normalized, detectedSchemas);
  const missingInputs = getMissingInputs(normalized);
  const status = issues.some((issue) => issue.id === "invalid-json-ld") || missingInputs.length ? "partial" : "completed";
  return {
    skill: "schema-entity-seo",
    status,
    score: score(issues),
    summary: `${status === "partial" ? "Partial schema audit completed" : "Schema audit completed"}. Detected ${detectedSchemas.length} schema type(s), recommended ${recommendedSchemas.length} schema type(s), and found ${issues.length} issue(s).`,
    detectedSchemas,
    recommendedSchemas,
    generatedJsonLd,
    entityFindings,
    richResultEligibility,
    issues,
    missingInputs,
    nextActions: buildNextActions(issues, recommendedSchemas)
  };
}

function validateSchemas(schemas: JsonObject[], input: SchemaAuditInput): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const typeCounts = new Map<string, number>();
  for (const schema of schemas) {
    const context = schema["@context"];
    const type = getPrimaryType(schema);
    if (!context) issues.push(issue("schema-missing-context", "schema-validation", "Missing @context", "P2", "JSON-LD object has no @context.", "Add @context: https://schema.org.", [JSON.stringify(schema).slice(0, 160)]));
    if (!type) issues.push(issue("schema-missing-type", "schema-validation", "Missing @type", "P1", "JSON-LD object has no @type.", "Add an accurate @type that matches visible content.", [JSON.stringify(schema).slice(0, 160)]));
    if (type) typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    if (type === "Organization") {
      if (!schema.name) issues.push(issue("organization-missing-name", "organization-schema", "Organization missing name", "P2", "Organization schema has no name.", "Use the real organization name from provided input or visible content.", [JSON.stringify(schema).slice(0, 160)]));
      if (!schema.url) issues.push(issue("organization-missing-url", "organization-schema", "Organization missing URL", "P3", "Organization schema has no URL.", "Add the canonical organization URL when available.", [JSON.stringify(schema).slice(0, 160)]));
    }
    if (type === "WebSite" && !schema.url) issues.push(issue("website-missing-url", "website-schema", "WebSite missing URL", "P2", "WebSite schema has no url.", "Add the canonical site URL.", [JSON.stringify(schema).slice(0, 160)]));
    if (type === "BreadcrumbList" && !schema.itemListElement) issues.push(issue("breadcrumb-missing-item-list", "breadcrumb-schema", "BreadcrumbList missing itemListElement", "P2", "BreadcrumbList has no itemListElement.", "Generate breadcrumb items only from visible breadcrumb data.", [JSON.stringify(schema).slice(0, 160)]));
    if (type === "Product") validateProduct(schema, input, issues);
    if (["Article", "BlogPosting", "TechArticle"].includes(type ?? "")) validateArticle(schema, issues);
    if (type === "SoftwareApplication" && !schema.applicationCategory) issues.push(issue("software-missing-application-category", "software-application-schema", "SoftwareApplication missing applicationCategory", "P3", "SoftwareApplication schema has no applicationCategory.", "Add applicationCategory only if provided and accurate.", [JSON.stringify(schema).slice(0, 160)]));
    if (type === "LocalBusiness") validateLocalBusiness(schema, issues);
    if (type === "VideoObject") validateVideo(schema, issues);
    if (type === "JobPosting") validateJobPosting(schema, issues);
    validateCanonicalConsistency(schema, input, issues);
  }
  for (const [type, count] of typeCounts.entries()) if (count > 1 && ["Organization", "WebSite", "Product", "Service", "SoftwareApplication", "LocalBusiness"].includes(type)) issues.push(issue("duplicate-conflicting-schema", "schema-validation", "Potential duplicate schema objects", "P2", `${type} appears ${count} times.`, "Keep one clear primary entity or make graph relationships explicit.", [type]));
  return issues;
}

function validateProduct(schema: JsonObject, input: SchemaAuditInput, issues: SchemaIssue[]): void {
  if (schema.aggregateRating && !hasVisibleReviewEvidence(input)) issues.push(issue("product-rating-without-visible-evidence", "product-schema", "Product rating lacks visible review evidence", "P1", "aggregateRating exists but visible review evidence was not provided.", "Remove ratings unless genuine reviews or ratings are visible and provided.", [JSON.stringify(schema.aggregateRating)]));
  if (schema.offers && isJsonObject(schema.offers) && (!schema.offers.price || !schema.offers.availability)) issues.push(issue("product-offers-missing-price-availability", "product-schema", "Product offers missing price or availability", "P2", "Product offers are incomplete.", "Include price and availability only when accurate and visible.", [JSON.stringify(schema.offers)]));
}

function validateArticle(schema: JsonObject, issues: SchemaIssue[]): void {
  if (!schema.headline) issues.push(issue("article-missing-headline", "article-schema", "Article missing headline", "P2", "Article schema has no headline.", "Use the visible article headline.", [JSON.stringify(schema).slice(0, 160)]));
  if (!schema.author) issues.push(issue("article-missing-author", "article-schema", "Article missing author", "P2", "Article schema has no author.", "Add a real visible author only if provided.", [JSON.stringify(schema).slice(0, 160)]));
  if (!schema.datePublished) issues.push(issue("article-missing-date-published", "article-schema", "Article missing datePublished", "P3", "Article schema has no datePublished.", "Add real publish date when provided.", [JSON.stringify(schema).slice(0, 160)]));
}

function validateLocalBusiness(schema: JsonObject, issues: SchemaIssue[]): void {
  if (!schema.address) issues.push(issue("local-business-missing-address", "local-business-schema", "LocalBusiness missing address", "P2", "LocalBusiness schema has no address.", "Add a real address only for a real location.", [JSON.stringify(schema).slice(0, 160)]));
  if (!schema.telephone) issues.push(issue("local-business-missing-telephone", "local-business-schema", "LocalBusiness missing telephone", "P3", "LocalBusiness schema has no telephone.", "Add real NAP details when provided.", [JSON.stringify(schema).slice(0, 160)]));
}

function validateVideo(schema: JsonObject, issues: SchemaIssue[]): void {
  if (!schema.thumbnailUrl) issues.push(issue("video-missing-thumbnail", "video-schema", "VideoObject missing thumbnailUrl", "P2", "VideoObject schema has no thumbnailUrl.", "Add real video thumbnails when provided.", [JSON.stringify(schema).slice(0, 160)]));
  if (!schema.uploadDate) issues.push(issue("video-missing-upload-date", "video-schema", "VideoObject missing uploadDate", "P3", "VideoObject schema has no uploadDate.", "Add real upload date when provided.", [JSON.stringify(schema).slice(0, 160)]));
}

function validateJobPosting(schema: JsonObject, issues: SchemaIssue[]): void {
  if (!schema.datePosted) issues.push(issue("job-posting-missing-date-posted", "job-posting-schema", "JobPosting missing datePosted", "P2", "JobPosting has no datePosted.", "Add the real posting date.", [JSON.stringify(schema).slice(0, 160)]));
  if (!schema.validThrough) issues.push(issue("job-posting-missing-valid-through", "job-posting-schema", "JobPosting missing validThrough", "P2", "JobPosting has no validThrough.", "Add an accurate expiration date and remove expired jobs.", [JSON.stringify(schema).slice(0, 160)]));
}

function validateCanonicalConsistency(schema: JsonObject, input: SchemaAuditInput, issues: SchemaIssue[]): void {
  const schemaUrl = typeof schema.url === "string" ? schema.url : typeof schema["@id"] === "string" ? schema["@id"] : undefined;
  const canonical = input.page?.canonicalUrl;
  if (schemaUrl && canonical && schemaUrl.replace(/#.*$/u, "") !== canonical) issues.push(issue("schema-url-canonical-mismatch", "schema-validation", "Schema URL does not match canonical", "P2", `${schemaUrl} != ${canonical}`, "Align schema url/@id with the canonical URL when they describe the page.", [schemaUrl, canonical]));
}

function validateProvidedEntities(input: SchemaAuditInput, schemas: JsonObject[]): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const orgSchema = schemas.find((schema) => getPrimaryType(schema) === "Organization");
  if (input.organization?.name && typeof orgSchema?.name === "string" && orgSchema.name !== input.organization.name) issues.push(issue("organization-name-mismatch", "entity-seo", "Organization name mismatch", "P2", `${orgSchema.name} != ${input.organization.name}`, "Use consistent organization naming across schema and provided entity data.", [String(orgSchema.name), input.organization.name]));
  for (const sameAs of [...(input.organization?.sameAs ?? []), ...(input.author?.sameAs ?? []), ...(input.localBusiness?.sameAs ?? [])]) if (!isUrl(sameAs)) issues.push(issue("sameas-non-url", "sameas-entity-relationships", "sameAs value is not a URL", "P3", sameAs, "Use only real, relevant profile/entity URLs in sameAs.", [sameAs]));
  if (["blog", "article"].includes(input.page?.pageType ?? "") && !input.author?.name && !schemas.some((schema) => ["Article", "BlogPosting"].includes(getPrimaryType(schema) ?? "") && schema.author)) issues.push(issue("article-missing-author-entity", "entity-seo", "Article missing author entity", "P3", "No author entity was provided for an article/blog page.", "Add a real visible author entity when available.", [input.page?.title ?? "article"]));
  if (["blog", "article"].includes(input.page?.pageType ?? "") && !input.organization?.name && !schemas.some((schema) => ["Article", "BlogPosting"].includes(getPrimaryType(schema) ?? "") && schema.publisher)) issues.push(issue("article-missing-publisher-entity", "entity-seo", "Article missing publisher entity", "P3", "No publisher entity was provided for an article/blog page.", "Add publisher only from real organization data.", [input.page?.title ?? "article"]));
  return issues;
}

function buildRichResultEligibility(recommended: string[], detected: string[], issues: SchemaIssue[]): RichResultFinding[] {
  const richTypes = ["BreadcrumbList", "Product", "Article", "BlogPosting", "VideoObject", "JobPosting", "FAQPage", "SoftwareApplication"];
  return [...new Set([...recommended, ...detected])].filter((type) => richTypes.includes(type)).map((schemaType) => {
    const relatedIssues = issues.filter((item) => item.category.includes(schemaType.replace(/[A-Z]/gu, (match) => `-${match.toLowerCase()}`).replace(/^-/, "")) || item.title.includes(schemaType));
    const hasP1 = relatedIssues.some((item) => item.priority === "P1" || item.priority === "P0");
    return { schemaType, status: hasP1 ? "quality_risk" : relatedIssues.length ? "missing_required_fields" : "valid_candidate", notes: ["Eligibility does not guarantee rich result display.", ...relatedIssues.map((item) => item.title)] };
  });
}

function buildEntityFindings(input: SchemaAuditInput, detectedSchemas: string[]): string[] {
  const findings: string[] = [];
  if (input.organization?.name) findings.push(`Organization entity provided: ${input.organization.name}`);
  if (input.product?.name) findings.push(`Product entity provided: ${input.product.name}`);
  if (input.service?.name) findings.push(`Service entity provided: ${input.service.name}`);
  if (input.author?.name) findings.push(`Author entity provided: ${input.author.name}`);
  if (detectedSchemas.length) findings.push(`Detected schema entities: ${detectedSchemas.join(", ")}`);
  return findings.length ? findings : ["No explicit entity details were provided."];
}

function getMissingInputs(input: SchemaAuditInput): string[] {
  const missing: string[] = [];
  if (!input.html && !input.jsonLd?.length) missing.push("html or jsonLd");
  if (!input.page) missing.push("page");
  return missing;
}

function buildNextActions(issues: SchemaIssue[], recommendedSchemas: string[]): string[] {
  return issues.length ? ["Fix P1/P2 schema validity and quality issues first.", "Generate or update schema only from visible, provided content."] : [`Consider implementing recommended schema types: ${recommendedSchemas.join(", ") || "none"}.`, "Validate schema before publishing."];
}

function needsInput(): SchemaAuditOutput {
  return { skill: "schema-entity-seo", status: "needs_input", score: 0, summary: "Needs input. Provide HTML, JSON-LD, page data, organization data, product/service data, or entity information.", detectedSchemas: [], recommendedSchemas: [], generatedJsonLd: [], entityFindings: [], richResultEligibility: [], issues: [], missingInputs: ["html", "jsonLd", "page", "organization", "product", "service", "softwareApplication", "localBusiness", "video", "jobPosting"], nextActions: ["Provide explicit schema/entity inputs.", "No live validation was performed."] };
}

function issue(id: string, category: string, title: string, priority: SchemaIssue["priority"], problem: string, howToFix: string, evidence: string[]): SchemaIssue {
  return makeSchemaIssue(id, category, title, priority, problem, howToFix, evidence);
}

function score(issues: SchemaIssue[]): number {
  return Math.max(0, 100 - issues.reduce((sum, item) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[item.priority]), 0));
}
