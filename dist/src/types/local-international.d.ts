import type { PriorityLabel } from "./index.ts";
import type { JsonObject } from "./schema.ts";
export type LocalMode = "audit" | "planning" | "local_pages" | "citations" | "reviews";
export type InternationalMode = "audit" | "hreflang" | "localization" | "planning";
export interface LocalSEOAuditInput {
    business?: {
        name?: string;
        website?: string;
        businessType?: "local_business" | "service_area_business" | "multi_location" | "ecommerce_local" | "professional_service" | "restaurant" | "healthcare" | "legal" | "home_service" | "unknown";
        categories?: string[];
        description?: string;
        phone?: string;
        email?: string;
        address?: {
            street?: string;
            city?: string;
            region?: string;
            postalCode?: string;
            country?: string;
        };
        openingHours?: string[];
        serviceAreas?: string[];
        sameAs?: string[];
    };
    locations?: Array<{
        name?: string;
        url?: string;
        phone?: string;
        address?: JsonObject;
        openingHours?: string[];
        serviceAreas?: string[];
        schema?: JsonObject;
    }>;
    pages?: Array<{
        url: string;
        pageType?: "homepage" | "local" | "service" | "location" | "contact" | "about" | "blog" | "unknown";
        title?: string;
        h1?: string;
        bodyText?: string;
        city?: string;
        region?: string;
        country?: string;
        napVisible?: boolean;
        mapVisible?: boolean;
        reviewsVisible?: boolean;
        localSchema?: JsonObject;
        canonicalUrl?: string;
        isIndexable?: boolean;
    }>;
    googleBusinessProfile?: {
        exists?: boolean;
        name?: string;
        primaryCategory?: string;
        secondaryCategories?: string[];
        phone?: string;
        website?: string;
        address?: JsonObject;
        openingHours?: string[];
        serviceAreas?: string[];
        photosPresent?: boolean;
        productsOrServicesPresent?: boolean;
        postsUsed?: boolean;
    };
    citations?: Array<{
        source?: string;
        businessName?: string;
        phone?: string;
        address?: JsonObject;
        url?: string;
    }>;
    reviews?: Array<{
        source?: "google" | "facebook" | "trustpilot" | "website" | "other" | "unknown";
        rating?: number;
        text?: string;
        date?: string;
        isVisible?: boolean;
        isVerified?: boolean;
    }>;
    mode: LocalMode;
}
export interface InternationalSEOAuditInput {
    site?: {
        defaultUrl?: string;
        defaultLanguage?: string;
        defaultCountry?: string;
        urlStrategy?: "subdirectory" | "subdomain" | "ccTLD" | "parameter" | "unknown";
    };
    pages?: Array<{
        url: string;
        language?: string;
        country?: string;
        title?: string;
        h1?: string;
        bodyText?: string;
        canonicalUrl?: string;
        isIndexable?: boolean;
        currency?: string;
        units?: string;
        hreflang?: Array<{
            lang: string;
            url: string;
        }>;
    }>;
    hreflangSets?: Array<{
        sourceUrl: string;
        alternates: Array<{
            lang: string;
            url: string;
        }>;
    }>;
    localizedContent?: Array<{
        url: string;
        language?: string;
        country?: string;
        translationQuality?: "human" | "machine" | "unknown";
        localizedCurrency?: boolean;
        localizedUnits?: boolean;
        localizedExamples?: boolean;
        mixedLanguageDetected?: boolean;
    }>;
    mode: InternationalMode;
}
export interface LocalInternationalIssue {
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
    appliesTo: Array<"local_seo" | "international_seo" | "hreflang" | "local_pages" | "audit">;
}
export interface LocalInternationalSEOOutput {
    skill: "local-international-seo";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    localFindings: string[];
    internationalFindings: string[];
    hreflangFindings: string[];
    napFindings: string[];
    localPageFindings: string[];
    localizedContentFindings: string[];
    issues: LocalInternationalIssue[];
    missingInputs: string[];
    nextActions: string[];
}
export interface LocalInternationalRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"local_seo" | "international_seo" | "hreflang" | "local_pages" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=local-international.d.ts.map