import type { JsonObject, SchemaAuditInput, SchemaIssue } from "../types/schema.ts";

export function hasSchemaInput(input: SchemaAuditInput): boolean {
  return Boolean(input.html || input.jsonLd?.length || input.page || input.organization || input.author || input.product || input.service || input.softwareApplication || input.localBusiness || input.video || input.jobPosting);
}

export function parseSchemaJson(value: string): unknown {
  return JSON.parse(value.replace(/\\"/gu, "\""));
}

export function parseJsonFlag<T>(value: string, fallback: T): T {
  try { return parseSchemaJson(value) as T; } catch { return fallback; }
}

export function extractJsonLdFromHtml(html = ""): { jsonLd: JsonObject[]; issues: SchemaIssue[] } {
  const jsonLd: JsonObject[] = [];
  const issues: SchemaIssue[] = [];
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu);
  for (const block of blocks) {
    const text = block[1]?.trim() ?? "";
    try {
      const parsed = JSON.parse(text) as JsonObject | JsonObject[];
      jsonLd.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      issues.push(makeSchemaIssue("invalid-json-ld", "schema-validation", "Invalid JSON-LD syntax", "P1", "A JSON-LD script block could not be parsed.", "Fix the JSON syntax in the provided JSON-LD block.", [text.slice(0, 120)]));
    }
  }
  return { jsonLd, issues };
}

export function getSchemaTypes(schemas: JsonObject[]): string[] {
  const types = new Set<string>();
  for (const schema of schemas) {
    collectType(schema, types);
    const graph = schema["@graph"];
    if (Array.isArray(graph)) for (const item of graph) if (isJsonObject(item)) collectType(item, types);
  }
  return [...types];
}

export function getPrimaryType(schema: JsonObject): string | undefined {
  const type = schema["@type"];
  if (Array.isArray(type)) return type.find((item): item is string => typeof item === "string");
  return typeof type === "string" ? type : undefined;
}

export function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function hasVisibleReviewEvidence(input: SchemaAuditInput): boolean {
  const visible = input.page?.visibleContent?.toLowerCase() ?? "";
  return Boolean(input.product?.reviews?.length || /\b(review|rating|stars?|customer)\b/u.test(visible));
}

export function isUrl(value: string): boolean {
  return /^https?:\/\/[^\s]+$/iu.test(value);
}

export function makeSchemaIssue(id: string, category: string, title: string, priority: SchemaIssue["priority"], problem: string, howToFix: string, evidence: string[]): SchemaIssue {
  return {
    id,
    category,
    title,
    priority,
    problem,
    whyItMatters: "Structured data must be accurate, valid, and aligned with visible page content to avoid eligibility and quality problems.",
    howToFix,
    do: ["Use JSON-LD", "Match schema to visible content", "Validate required and recommended fields"],
    dont: ["Invent fake fields", "Use fake reviews or ratings", "Mark up hidden or misleading content"],
    evidence,
    appliesTo: ["schema", "entity", "rich_results", "audit"]
  };
}

function collectType(schema: JsonObject, types: Set<string>): void {
  const type = schema["@type"];
  if (typeof type === "string") types.add(type);
  if (Array.isArray(type)) for (const item of type) if (typeof item === "string") types.add(item);
}
