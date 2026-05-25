import type { JsonObject } from "../types/schema.ts";
import type { LocalInternationalIssue, LocalInternationalSEOOutput, LocalSEOAuditInput } from "../types/local-international.ts";

export function runLocalSEOAudit(input: LocalSEOAuditInput): LocalInternationalSEOOutput {
  const normalized: LocalSEOAuditInput = { ...input, mode: input.mode ?? "audit" };
  if (!hasInput(normalized)) return needsInput("local");
  const issues = [
    ...checkBusinessNap(normalized),
    ...checkGoogleBusinessProfile(normalized),
    ...checkCitations(normalized),
    ...checkLocalPages(normalized),
    ...checkReviews(normalized),
    ...checkMultiLocation(normalized)
  ];
  const missingInputs = getMissingInputs(normalized);
  const status = missingInputs.length ? "partial" : "completed";
  return {
    skill: "local-international-seo",
    status,
    score: score(issues),
    summary: `${status === "partial" ? "Partial local SEO audit completed" : "Local SEO audit completed"}. Reviewed ${normalized.pages?.length ?? 0} page(s), ${normalized.locations?.length ?? 0} location(s), ${normalized.citations?.length ?? 0} citation(s), and found ${issues.length} issue(s).`,
    localFindings: [`Business provided: ${normalized.business?.name ?? "not provided"}`, `Locations reviewed: ${normalized.locations?.length ?? 0}`],
    internationalFindings: [],
    hreflangFindings: [],
    napFindings: issues.filter((issue) => issue.category === "nap-consistency").map((issue) => issue.title),
    localPageFindings: [`Local pages reviewed: ${normalized.pages?.length ?? 0}`],
    localizedContentFindings: [],
    issues,
    missingInputs,
    nextActions: issues.length ? ["Fix P1/P2 NAP, GBP, local page, and schema issues first.", "Provide explicit local data for deeper checks."] : ["Keep NAP and local page data consistent."]
  };
}

export function parseLocalSEOInputFromText(rawInput: string): LocalSEOAuditInput {
  const input: LocalSEOAuditInput = { mode: "audit" };
  const args = rawInput.replace(/^\/seo-master\s+(?:local-seo|local-seo-audit)\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "business") input.business = parseJsonFlag(value, undefined);
    if (key === "locations") input.locations = parseJsonFlag(value, []);
    if (key === "pages") input.pages = parseJsonFlag(value, []);
    if (key === "googleBusinessProfile" || key === "google-business-profile" || key === "gbp") input.googleBusinessProfile = parseJsonFlag(value, undefined);
    if (key === "citations") input.citations = parseJsonFlag(value, []);
    if (key === "reviews") input.reviews = parseJsonFlag(value, []);
    if (key === "mode" && ["audit", "planning", "local_pages", "citations", "reviews"].includes(value)) input.mode = value as LocalSEOAuditInput["mode"];
  }
  return input;
}

function checkBusinessNap(input: LocalSEOAuditInput): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  const business = input.business;
  if (!business) return issues;
  const locationBased = !["service_area_business", "unknown"].includes(business.businessType ?? "");
  if (!business.name) issues.push(issue("local-business-missing-name", "nap-consistency", "P2", "Business name missing", "Provide the real business name.", ["business"], ["local_seo", "audit"]));
  if (!business.phone) issues.push(issue("local-business-missing-phone", "nap-consistency", "P2", "Local business missing phone", "Provide the real phone number if the business uses one.", [business.name ?? "business"], ["local_seo", "audit"]));
  if (locationBased && !hasAddress(business.address)) issues.push(issue("local-business-missing-address", "nap-consistency", "P2", "Location-based business missing address", "Provide the real address for location-based businesses.", [business.name ?? "business"], ["local_seo", "audit"]));
  const phones = new Set([business.phone, input.googleBusinessProfile?.phone, ...(input.locations ?? []).map((location) => location.phone), ...(input.citations ?? []).map((citation) => citation.phone)].filter((phone): phone is string => Boolean(phone)));
  if (phones.size > 1) issues.push(issue("multiple-inconsistent-phone-numbers", "nap-consistency", "P2", "Multiple inconsistent phone numbers found", "Standardize phone usage or document multi-location numbers clearly.", [...phones], ["local_seo", "audit"]));
  const gbp = input.googleBusinessProfile;
  if (gbp) {
    if (business.name && gbp.name && normalize(business.name) !== normalize(gbp.name)) issues.push(issue("website-gbp-name-mismatch", "nap-consistency", "P2", "Website business name mismatches GBP", "Align business names across website and Google Business Profile.", [business.name, gbp.name], ["local_seo", "audit"]));
    if (business.phone && gbp.phone && normalizePhone(business.phone) !== normalizePhone(gbp.phone)) issues.push(issue("website-gbp-phone-mismatch", "nap-consistency", "P2", "Website phone mismatches GBP", "Align phone numbers across website and Google Business Profile.", [business.phone, gbp.phone], ["local_seo", "audit"]));
    if (hasAddress(business.address) && gbp.address && JSON.stringify(business.address) !== JSON.stringify(gbp.address)) issues.push(issue("website-gbp-address-mismatch", "nap-consistency", "P2", "Website address mismatches GBP", "Align address details across website and Google Business Profile.", [JSON.stringify(business.address), JSON.stringify(gbp.address)], ["local_seo", "audit"]));
  }
  return issues;
}

function checkGoogleBusinessProfile(input: LocalSEOAuditInput): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  const gbp = input.googleBusinessProfile;
  const localBusiness = input.business && input.business.businessType !== "unknown";
  if (localBusiness && gbp?.exists === false) issues.push(issue("gbp-missing-for-local-business", "google-business-profile", "P2", "Google Business Profile not provided for local business", "Create or claim GBP where relevant.", [input.business?.name ?? "business"], ["local_seo", "audit"]));
  if (!gbp) return issues;
  if (!gbp.primaryCategory) issues.push(issue("gbp-missing-primary-category", "google-business-profile", "P2", "GBP missing primary category", "Choose an accurate primary category.", [gbp.name ?? "GBP"], ["local_seo", "audit"]));
  if (!gbp.phone) issues.push(issue("gbp-missing-phone", "google-business-profile", "P2", "GBP missing phone", "Add the real phone number when applicable.", [gbp.name ?? "GBP"], ["local_seo", "audit"]));
  if (!gbp.website) issues.push(issue("gbp-missing-website", "google-business-profile", "P2", "GBP missing website", "Add the correct website URL.", [gbp.name ?? "GBP"], ["local_seo", "audit"]));
  if (!gbp.openingHours?.length) issues.push(issue("gbp-missing-hours", "google-business-profile", "P2", "GBP missing opening hours", "Add real opening hours.", [gbp.name ?? "GBP"], ["local_seo", "audit"]));
  if (gbp.photosPresent === false) issues.push(issue("gbp-missing-photos", "google-business-profile", "P3", "GBP photos not provided", "Add real business photos where relevant.", [gbp.name ?? "GBP"], ["local_seo", "audit"]));
  if (gbp.productsOrServicesPresent === false) issues.push(issue("gbp-missing-products-services", "google-business-profile", "P3", "GBP products/services not provided", "Add real services/products where relevant.", [gbp.name ?? "GBP"], ["local_seo", "audit"]));
  if (gbp.name && looksKeywordStuffedName(gbp.name)) issues.push(issue("gbp-name-keyword-stuffing", "google-business-profile", "P2", "GBP business name may be keyword-stuffed", "Use the real-world business name.", [gbp.name], ["local_seo", "audit"]));
  return issues;
}

function checkCitations(input: LocalSEOAuditInput): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  const business = input.business;
  for (const citation of input.citations ?? []) {
    if (business?.name && citation.businessName && normalize(business.name) !== normalize(citation.businessName)) issues.push(issue("citation-business-name-mismatch", "nap-consistency", "P2", "Citation business name mismatch", "Fix citation business name consistency.", [citation.source ?? "citation", citation.businessName], ["local_seo", "audit"]));
    if (business?.phone && citation.phone && normalizePhone(business.phone) !== normalizePhone(citation.phone)) issues.push(issue("citation-phone-mismatch", "nap-consistency", "P2", "Citation phone mismatch", "Fix citation phone consistency.", [citation.source ?? "citation", citation.phone], ["local_seo", "audit"]));
    if (business?.address && citation.address && JSON.stringify(business.address) !== JSON.stringify(citation.address)) issues.push(issue("citation-address-mismatch", "nap-consistency", "P3", "Citation address mismatch", "Fix citation address consistency.", [citation.source ?? "citation"], ["local_seo", "audit"]));
  }
  return issues;
}

function checkLocalPages(input: LocalSEOAuditInput): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  const bodies = new Map<string, string[]>();
  for (const page of input.pages ?? []) {
    const localPage = ["local", "location", "service", "contact"].includes(page.pageType ?? "");
    if (!localPage) continue;
    const text = `${page.title ?? ""} ${page.h1 ?? ""} ${page.bodyText ?? ""}`.toLowerCase();
    if ((page.city && !text.includes(page.city.toLowerCase())) || (page.region && !text.includes(page.region.toLowerCase()))) issues.push(issue("local-page-missing-location-signal", "local-landing-pages", "P2", "Local page missing city/region in title/H1/body", "Include real served location context in useful copy.", [page.url], ["local_pages", "audit"]));
    if ((page.bodyText?.split(/\s+/u).filter(Boolean).length ?? 0) > 0 && (page.bodyText?.split(/\s+/u).filter(Boolean).length ?? 0) < 250) issues.push(issue("thin-local-landing-page", "local-landing-pages", "P2", "Local landing page is thin", "Add unique local proof, service details, FAQs, and contact info.", [page.url], ["local_pages", "audit"]));
    if (page.napVisible === false) issues.push(issue("local-page-missing-nap", "local-landing-pages", "P2", "Local page missing visible NAP", "Show accurate name, address, and phone where applicable.", [page.url], ["local_pages", "audit"]));
    if (page.mapVisible === false) issues.push(issue("local-page-missing-map-contact", "local-landing-pages", "P3", "Local page missing map/contact signal", "Show map/contact details where relevant.", [page.url], ["local_pages", "audit"]));
    if (!page.localSchema) issues.push(issue("local-page-missing-localbusiness-schema", "local-business-schema", "P2", "Local page missing LocalBusiness schema", "Add LocalBusiness schema only from visible real local details.", [page.url], ["local_pages", "audit"]));
    if (page.localSchema) issues.push(...checkLocalSchemaConflict(page.localSchema, input, page.url));
    if (page.canonicalUrl && input.business?.website && page.canonicalUrl === input.business.website) issues.push(issue("location-page-canonicalized-to-headquarters", "multi-location-seo", "P2", "Location page canonicalized to headquarters/homepage", "Use self-canonical for unique real location pages.", [page.url, page.canonicalUrl], ["local_pages", "audit"]));
    if (page.bodyText) bodies.set(normalize(page.bodyText), [...(bodies.get(normalize(page.bodyText)) ?? []), page.url]);
  }
  for (const [body, urls] of bodies.entries()) if (body && urls.length > 1) issues.push(issue("duplicate-location-page-copy", "multi-location-seo", "P2", "Multiple location pages share exact same body text", "Write unique local proof and service details per real location.", urls, ["local_pages", "audit"]));
  if ((input.locations?.length ?? 0) > 5 && !(input.pages ?? []).some((page) => /locations?|stores?/iu.test(page.url))) issues.push(issue("missing-location-finder", "multi-location-seo", "P3", "Many locations but no provided location finder page", "Create a crawlable store/location finder.", [String(input.locations?.length ?? 0)], ["local_pages", "audit"]));
  return issues;
}

function checkReviews(input: LocalSEOAuditInput): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  for (const review of input.reviews ?? []) {
    if (review.rating !== undefined && (review.rating < 1 || review.rating > 5)) issues.push(issue("local-review-rating-out-of-range", "review-authenticity", "P2", "Review rating outside 1-5", "Use only valid genuine review ratings.", [String(review.rating)], ["local_seo", "audit"]));
    if (!review.text && review.isVerified === false) issues.push(issue("empty-unverified-review", "review-authenticity", "P3", "Review has empty text and is unverified", "Use genuine visible reviews; do not assume authenticity without evidence.", [review.source ?? "review"], ["local_seo", "audit"]));
  }
  for (const page of input.pages ?? []) if (["local", "location"].includes(page.pageType ?? "") && page.reviewsVisible === false) issues.push(issue("local-page-no-visible-reviews", "review-authenticity", "P3", "Local page has no visible reviews", "Show genuine reviews where relevant.", [page.url], ["local_pages", "audit"]));
  return issues;
}

function checkMultiLocation(input: LocalSEOAuditInput): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  const locationNames = new Set((input.locations ?? []).map((location) => location.name).filter(Boolean));
  if ((input.locations?.length ?? 0) > 1 && locationNames.size < (input.locations?.length ?? 0)) issues.push(issue("multi-location-name-duplicates", "multi-location-seo", "P3", "Multiple locations have duplicate/missing names", "Use clear unique location names.", [String(input.locations?.length ?? 0)], ["local_pages", "audit"]));
  return issues;
}

function checkLocalSchemaConflict(schema: JsonObject, input: LocalSEOAuditInput, url: string): LocalInternationalIssue[] {
  const issues: LocalInternationalIssue[] = [];
  if (schema.name && input.business?.name && normalize(String(schema.name)) !== normalize(input.business.name)) issues.push(issue("localbusiness-schema-name-conflict", "local-business-schema", "P2", "LocalBusiness schema name conflicts with business name", "Keep schema consistent with visible/provided NAP.", [url, String(schema.name), input.business.name], ["local_pages", "audit"]));
  if (schema.telephone && input.business?.phone && normalizePhone(String(schema.telephone)) !== normalizePhone(input.business.phone)) issues.push(issue("localbusiness-schema-phone-conflict", "local-business-schema", "P2", "LocalBusiness schema phone conflicts with business phone", "Keep schema phone consistent with visible/provided NAP.", [url, String(schema.telephone), input.business.phone], ["local_pages", "audit"]));
  return issues;
}

function hasInput(input: LocalSEOAuditInput): boolean {
  return Boolean(input.business || input.locations?.length || input.pages?.length || input.googleBusinessProfile || input.citations?.length || input.reviews?.length);
}

function getMissingInputs(input: LocalSEOAuditInput): string[] {
  const missing: string[] = [];
  if (!input.business) missing.push("business");
  if (!input.locations?.length) missing.push("locations");
  if (!input.pages?.length) missing.push("pages");
  if (!input.googleBusinessProfile) missing.push("googleBusinessProfile");
  if (!input.citations?.length) missing.push("citations");
  if (!input.reviews?.length) missing.push("reviews");
  return missing;
}

export function needsInput(kind: "local" | "international"): LocalInternationalSEOOutput {
  const local = kind === "local";
  return { skill: "local-international-seo", status: "needs_input", score: 0, summary: local ? "Needs input. Provide business, location, GBP, citation, review, page, or LocalBusiness schema data." : "Needs input. Provide site, page, hreflang, language/country, or localized content data.", localFindings: [], internationalFindings: [], hreflangFindings: [], napFindings: [], localPageFindings: [], localizedContentFindings: [], issues: [], missingInputs: local ? ["business", "locations", "pages", "googleBusinessProfile", "citations", "reviews"] : ["site", "pages", "hreflangSets", "localizedContent"], nextActions: ["Provide explicit local/international SEO inputs.", "No live provider fetching was performed."] };
}

export function issue(id: string, category: string, priority: LocalInternationalIssue["priority"], title: string, howToFix: string, evidence: string[], appliesTo: LocalInternationalIssue["appliesTo"]): LocalInternationalIssue {
  return { id, category, title, priority, problem: evidence.join("; "), whyItMatters: "Local and international SEO depend on accurate location, language, country, and alternate URL signals.", howToFix, do: ["Use accurate provided data", "Keep targeting and entity details consistent", "Make local/international pages useful to users"], dont: ["Invent addresses, reviews, phone numbers, hours, or targeting", "Create doorway or duplicate localized pages", "Use conflicting hreflang/canonical signals"], evidence, appliesTo };
}

export function score(issues: LocalInternationalIssue[]): number {
  return Math.max(0, 100 - issues.reduce((sum, item) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[item.priority]), 0));
}

export function parseJsonFlag<T>(value: string, fallback: T): T {
  try { return JSON.parse(value.replace(/\\"/gu, "\"")) as T; } catch { return fallback; }
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/giu, " ").trim();
}

function normalizePhone(value: string): string {
  return value.replace(/\D+/gu, "");
}

function hasAddress(address?: NonNullable<LocalSEOAuditInput["business"]>["address"]): boolean {
  return Boolean(address?.city || address?.street || address?.postalCode);
}

function looksKeywordStuffedName(name: string): boolean {
  return name.split(/\s+/u).length > 6 || /\b(best|near me|cheap|top|#1)\b/iu.test(name);
}
