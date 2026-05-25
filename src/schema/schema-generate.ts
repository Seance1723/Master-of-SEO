import type { JsonObject, SchemaAuditInput, SchemaAuditOutput } from "../types/schema.ts";
import { recommendSchemaTypes } from "./schema-selection.ts";
import { hasSchemaInput, parseJsonFlag } from "./schema-utils.ts";

export function generateSchemaJsonLd(input: SchemaAuditInput): JsonObject[] {
  const generated: JsonObject[] = [];
  const pageUrl = input.page?.url ?? input.url;
  if (input.organization?.name) {
    generated.push(clean({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: input.organization.name,
      url: input.organization.url,
      logo: input.organization.logo,
      description: input.organization.description,
      sameAs: input.organization.sameAs,
      contactPoint: input.organization.contactPoint
    }));
  }
  if (pageUrl && (input.page?.pageType === "homepage" || input.organization || input.url)) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "WebSite", name: input.organization?.name ?? input.page?.title, url: pageUrl, publisher: input.organization?.name ? { "@type": "Organization", name: input.organization.name } : undefined }));
  }
  if (input.page?.breadcrumbs?.length) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: input.page.breadcrumbs.map((item, index) => clean({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) }));
  }
  if (["blog", "article"].includes(input.page?.pageType ?? "") && input.page?.title) {
    generated.push(clean({ "@context": "https://schema.org", "@type": input.page?.pageType === "blog" ? "BlogPosting" : "Article", headline: input.page.title, description: input.page.description, author: input.author?.name ? clean({ "@type": "Person", name: input.author.name, url: input.author.url, sameAs: input.author.sameAs, jobTitle: input.author.jobTitle }) : undefined, publisher: input.organization?.name ? clean({ "@type": "Organization", name: input.organization.name, url: input.organization.url, logo: input.organization.logo }) : undefined, mainEntityOfPage: pageUrl }));
  }
  if (input.product?.name) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "Product", name: input.product.name, description: input.product.description, image: input.product.image, brand: input.product.brand, sku: input.product.sku, offers: input.product.offers, aggregateRating: input.product.aggregateRating, review: input.product.reviews }));
  }
  if (input.service?.name) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "Service", name: input.service.name, description: input.service.description, provider: input.service.provider ? { "@type": "Organization", name: input.service.provider } : input.organization?.name ? { "@type": "Organization", name: input.organization.name } : undefined, areaServed: input.service.areaServed, serviceType: input.service.serviceType }));
  }
  if (input.softwareApplication?.name) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: input.softwareApplication.name, applicationCategory: input.softwareApplication.applicationCategory, operatingSystem: input.softwareApplication.operatingSystem, description: input.softwareApplication.description, offers: input.softwareApplication.offers, publisher: input.organization?.name ? { "@type": "Organization", name: input.organization.name } : undefined }));
  }
  if (input.localBusiness?.name) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "LocalBusiness", name: input.localBusiness.name, address: input.localBusiness.address, telephone: input.localBusiness.telephone, openingHours: input.localBusiness.openingHours, geo: input.localBusiness.geo, sameAs: input.localBusiness.sameAs }));
  }
  if (hasVisibleFaq(input)) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "FAQPage" }));
  }
  if (input.video?.name) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "VideoObject", name: input.video.name, description: input.video.description, thumbnailUrl: input.video.thumbnailUrl, uploadDate: input.video.uploadDate, duration: input.video.duration, contentUrl: input.video.contentUrl, embedUrl: input.video.embedUrl }));
  }
  if (input.jobPosting?.title) {
    generated.push(clean({ "@context": "https://schema.org", "@type": "JobPosting", title: input.jobPosting.title, description: input.jobPosting.description, datePosted: input.jobPosting.datePosted, validThrough: input.jobPosting.validThrough, employmentType: input.jobPosting.employmentType, hiringOrganization: input.jobPosting.hiringOrganization, jobLocation: input.jobPosting.jobLocation }));
  }
  return generated;
}

export function runSchemaGenerate(input: SchemaAuditInput): SchemaAuditOutput {
  if (!hasSchemaInput(input)) {
    return { skill: "schema-entity-seo", status: "needs_input", score: 0, summary: "Needs input. Provide HTML, JSON-LD, page data, organization data, product/service data, or entity information.", detectedSchemas: [], recommendedSchemas: [], generatedJsonLd: [], entityFindings: [], richResultEligibility: [], issues: [], missingInputs: ["html", "jsonLd", "page", "organization", "product", "service", "softwareApplication", "localBusiness", "video", "jobPosting"], nextActions: ["Provide explicit schema generation inputs."] };
  }
  const generatedJsonLd = generateSchemaJsonLd(input);
  return { skill: "schema-entity-seo", status: "completed", score: 100, summary: `Generated ${generatedJsonLd.length} safe JSON-LD object(s) from provided inputs only.`, detectedSchemas: [], recommendedSchemas: recommendSchemaTypes(input), generatedJsonLd, entityFindings: ["Generated schema omits missing fields instead of inventing them."], richResultEligibility: [], issues: [], missingInputs: [], nextActions: ["Validate generated JSON-LD before publishing."] };
}

export function parseSchemaInputFromText(rawInput: string): SchemaAuditInput {
  const input: SchemaAuditInput = { mode: rawInput.includes("schema-generate") ? "generate" : "audit" };
  const args = rawInput.replace(/^\/seo-master\s+(?:schema-audit|schema-generate)\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "url") input.url = value;
    if (key === "html") input.html = value;
    if (key === "jsonLd" || key === "json-ld") input.jsonLd = parseJsonFlag(value, []);
    if (key === "page") input.page = parseJsonFlag(value, undefined);
    if (key === "organization") input.organization = parseJsonFlag(value, undefined);
    if (key === "author") input.author = parseJsonFlag(value, undefined);
    if (key === "product") input.product = parseJsonFlag(value, undefined);
    if (key === "service") input.service = parseJsonFlag(value, undefined);
    if (key === "softwareApplication" || key === "software-application") input.softwareApplication = parseJsonFlag(value, undefined);
    if (key === "localBusiness" || key === "local-business") input.localBusiness = parseJsonFlag(value, undefined);
    if (key === "video") input.video = parseJsonFlag(value, undefined);
    if (key === "jobPosting" || key === "job-posting") input.jobPosting = parseJsonFlag(value, undefined);
    if (key === "mode" && ["audit", "generate", "validate", "planning"].includes(value)) input.mode = value as SchemaAuditInput["mode"];
  }
  return input;
}

function clean<T extends JsonObject>(object: T): JsonObject {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && (!Array.isArray(value) || value.length > 0))) as JsonObject;
}

function hasVisibleFaq(input: SchemaAuditInput): boolean {
  return /\b(faq|frequently asked questions)\b/iu.test(input.page?.visibleContent ?? "");
}
