export type CMSFrameworkStatus = "completed" | "partial" | "needs_input";
export type CMSFrameworkPriority = "P0" | "P1" | "P2" | "P3";
export type FrameworkName = "wordpress" | "react" | "nextjs" | "static" | "vue" | "nuxt" | "angular" | "svelte" | "astro" | "remix" | "unknown";
export interface CMSFrameworkAuditInput {
    url?: string;
    html?: string;
    framework?: FrameworkName;
    cms?: {
        name?: "wordpress" | "shopify" | "webflow" | "custom" | "unknown";
        version?: string;
        theme?: string;
        plugins?: Array<{
            name: string;
            type?: "seo" | "cache" | "schema" | "performance" | "security" | "builder" | "unknown";
            active?: boolean;
        }>;
        settings?: {
            permalinkStructure?: string;
            discourageSearchEngines?: boolean;
            attachmentPagesIndexable?: boolean;
            tagArchivesIndexable?: boolean;
            categoryArchivesIndexable?: boolean;
            authorArchivesIndexable?: boolean;
            dateArchivesIndexable?: boolean;
            xmlSitemapEnabled?: boolean;
            robotsTxtEditable?: boolean;
        };
    };
    packageJson?: Record<string, unknown>;
    frameworkConfig?: {
        nextConfig?: Record<string, unknown>;
        viteConfig?: Record<string, unknown>;
        astroConfig?: Record<string, unknown>;
        remixConfig?: Record<string, unknown>;
        otherConfig?: Record<string, unknown>;
    };
    routes?: Array<{
        path: string;
        pageType?: "homepage" | "service" | "product" | "category" | "blog" | "article" | "landing" | "pricing" | "documentation" | "contact" | "about" | "unknown";
        rendering?: "ssr" | "ssg" | "csr" | "isr" | "static" | "unknown";
        title?: string;
        metaDescription?: string;
        canonicalUrl?: string;
        robots?: string;
        hasOpenGraph?: boolean;
        hasJsonLd?: boolean;
        isIndexable?: boolean;
    }>;
    build?: {
        status?: "passed" | "failed" | "unknown";
        outputDir?: string;
        errors?: string[];
        warnings?: string[];
        generatedSitemap?: boolean;
        generatedRobotsTxt?: boolean;
        generatedStaticRoutes?: string[];
    };
    seoFiles?: {
        robotsTxt?: string;
        sitemapXml?: string;
        metadataFiles?: string[];
    };
    mode?: "framework" | "wordpress" | "react" | "nextjs" | "static" | "build" | "audit";
}
export interface CMSFrameworkIssue {
    id: string;
    category: string;
    title: string;
    priority: CMSFrameworkPriority;
    problem: string;
    whyItMatters: string;
    howToFix: string;
    do: string[];
    dont: string[];
    evidence: string[];
    appliesTo: Array<"cms" | "framework" | "wordpress" | "react" | "nextjs" | "static" | "build" | "audit">;
}
export interface CMSFrameworkAuditOutput {
    skill: "cms-framework-seo";
    status: CMSFrameworkStatus;
    score: number;
    summary: string;
    frameworkFindings: string[];
    wordpressFindings: string[];
    reactFindings: string[];
    nextjsFindings: string[];
    staticFindings: string[];
    buildFindings: string[];
    issues: CMSFrameworkIssue[];
    missingInputs: string[];
    nextActions: string[];
}
//# sourceMappingURL=cms-framework.d.ts.map