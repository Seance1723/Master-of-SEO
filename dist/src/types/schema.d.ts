import type { PriorityLabel } from "./index.ts";
export type SchemaPageType = "homepage" | "service" | "product" | "category" | "blog" | "article" | "landing" | "pricing" | "comparison" | "documentation" | "local" | "job" | "video" | "contact" | "about" | "unknown";
export type SchemaMode = "audit" | "generate" | "validate" | "planning";
export type RichResultStatus = "valid_candidate" | "missing_required_fields" | "quality_risk" | "not_applicable";
export interface SchemaAuditInput {
    url?: string;
    html?: string;
    jsonLd?: JsonObject[];
    page?: {
        url?: string;
        title?: string;
        description?: string;
        pageType?: SchemaPageType;
        canonicalUrl?: string;
        visibleContent?: string;
        breadcrumbs?: Array<{
            name: string;
            url?: string;
        }>;
    };
    organization?: {
        name?: string;
        url?: string;
        logo?: string;
        description?: string;
        sameAs?: string[];
        contactPoint?: JsonObject;
    };
    author?: {
        name?: string;
        url?: string;
        sameAs?: string[];
        jobTitle?: string;
    };
    product?: {
        name?: string;
        description?: string;
        image?: string[];
        brand?: string;
        sku?: string;
        offers?: JsonObject;
        aggregateRating?: JsonObject;
        reviews?: JsonObject[];
    };
    service?: {
        name?: string;
        description?: string;
        provider?: string;
        areaServed?: string[];
        serviceType?: string;
    };
    softwareApplication?: {
        name?: string;
        applicationCategory?: string;
        operatingSystem?: string;
        description?: string;
        offers?: JsonObject;
    };
    localBusiness?: {
        name?: string;
        address?: JsonObject;
        telephone?: string;
        openingHours?: string[];
        geo?: JsonObject;
        sameAs?: string[];
    };
    video?: {
        name?: string;
        description?: string;
        thumbnailUrl?: string[];
        uploadDate?: string;
        duration?: string;
        contentUrl?: string;
        embedUrl?: string;
    };
    jobPosting?: {
        title?: string;
        description?: string;
        datePosted?: string;
        validThrough?: string;
        employmentType?: string;
        hiringOrganization?: JsonObject;
        jobLocation?: JsonObject;
    };
    mode: SchemaMode;
}
export interface SchemaIssue {
    id: string;
    category: string;
    title: string;
    priority: PriorityLabel;
    problem: string;
    whyItMatters: string;
    howToFix: string;
    do: string[];
    dont: string[];
    evidence: string[];
    appliesTo: Array<"schema" | "entity" | "rich_results" | "audit" | "planning">;
}
export interface RichResultFinding {
    schemaType: string;
    status: RichResultStatus;
    notes: string[];
}
export interface SchemaAuditOutput {
    skill: "schema-entity-seo";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    detectedSchemas: string[];
    recommendedSchemas: string[];
    generatedJsonLd: JsonObject[];
    entityFindings: string[];
    richResultEligibility: RichResultFinding[];
    issues: SchemaIssue[];
    missingInputs: string[];
    nextActions: string[];
}
export interface SchemaRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"schema" | "entity" | "rich_results" | "audit" | "planning">;
    status: "active" | "planned";
}
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject {
    [key: string]: JsonValue | undefined;
}
//# sourceMappingURL=schema.d.ts.map