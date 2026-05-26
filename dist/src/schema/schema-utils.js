export function hasSchemaInput(input) {
    return Boolean(input.html || input.jsonLd?.length || input.page || input.organization || input.author || input.product || input.service || input.softwareApplication || input.localBusiness || input.video || input.jobPosting);
}
export function parseSchemaJson(value) {
    return JSON.parse(value.replace(/\\"/gu, "\""));
}
export function parseJsonFlag(value, fallback) {
    try {
        return parseSchemaJson(value);
    }
    catch {
        return fallback;
    }
}
export function extractJsonLdFromHtml(html = "") {
    const jsonLd = [];
    const issues = [];
    const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu);
    for (const block of blocks) {
        const text = block[1]?.trim() ?? "";
        try {
            const parsed = JSON.parse(text);
            jsonLd.push(...(Array.isArray(parsed) ? parsed : [parsed]));
        }
        catch {
            issues.push(makeSchemaIssue("invalid-json-ld", "schema-validation", "Invalid JSON-LD syntax", "P1", "A JSON-LD script block could not be parsed.", "Fix the JSON syntax in the provided JSON-LD block.", [text.slice(0, 120)]));
        }
    }
    return { jsonLd, issues };
}
export function getSchemaTypes(schemas) {
    const types = new Set();
    for (const schema of schemas) {
        collectType(schema, types);
        const graph = schema["@graph"];
        if (Array.isArray(graph))
            for (const item of graph)
                if (isJsonObject(item))
                    collectType(item, types);
    }
    return [...types];
}
export function getPrimaryType(schema) {
    const type = schema["@type"];
    if (Array.isArray(type))
        return type.find((item) => typeof item === "string");
    return typeof type === "string" ? type : undefined;
}
export function isJsonObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
export function hasVisibleReviewEvidence(input) {
    const visible = input.page?.visibleContent?.toLowerCase() ?? "";
    return Boolean(input.product?.reviews?.length || /\b(review|rating|stars?|customer)\b/u.test(visible));
}
export function isUrl(value) {
    return /^https?:\/\/[^\s]+$/iu.test(value);
}
export function makeSchemaIssue(id, category, title, priority, problem, howToFix, evidence) {
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
function collectType(schema, types) {
    const type = schema["@type"];
    if (typeof type === "string")
        types.add(type);
    if (Array.isArray(type))
        for (const item of type)
            if (typeof item === "string")
                types.add(item);
}
//# sourceMappingURL=schema-utils.js.map