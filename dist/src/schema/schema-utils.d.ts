import type { JsonObject, SchemaAuditInput, SchemaIssue } from "../types/schema.ts";
export declare function hasSchemaInput(input: SchemaAuditInput): boolean;
export declare function parseSchemaJson(value: string): unknown;
export declare function parseJsonFlag<T>(value: string, fallback: T): T;
export declare function extractJsonLdFromHtml(html?: string): {
    jsonLd: JsonObject[];
    issues: SchemaIssue[];
};
export declare function getSchemaTypes(schemas: JsonObject[]): string[];
export declare function getPrimaryType(schema: JsonObject): string | undefined;
export declare function isJsonObject(value: unknown): value is JsonObject;
export declare function hasVisibleReviewEvidence(input: SchemaAuditInput): boolean;
export declare function isUrl(value: string): boolean;
export declare function makeSchemaIssue(id: string, category: string, title: string, priority: SchemaIssue["priority"], problem: string, howToFix: string, evidence: string[]): SchemaIssue;
//# sourceMappingURL=schema-utils.d.ts.map