import { runAISearchAudit } from "../ai-discover/ai-search-audit.js";
import { runDiscoverSEOAudit } from "../ai-discover/discover-seo-audit.js";
import { runArchitectureAudit } from "../architecture/architecture-audit.js";
import { runFrameworkSEOAudit } from "../cms-framework/framework-seo-audit.js";
import { runContentPlan } from "../content/content-plan.js";
import { runEcommerceAudit } from "../ecommerce/ecommerce-audit.js";
import { runKeywordResearch } from "../keywords/keyword-research.js";
import { runInternationalSEOAudit } from "../local-international/international-seo-audit.js";
import { runLocalSEOAudit } from "../local-international/local-seo-audit.js";
import { runMediaAudit } from "../media/media-audit.js";
import { runOnPageAudit } from "../on-page/on-page-audit.js";
import { runPerformanceAudit } from "../performance/performance-audit.js";
import { runSchemaAudit } from "../schema/schema-audit.js";
import { runTechnicalAudit } from "../technical/technical-audit.js";
import { runAccessibilityAudit } from "../trust-security-accessibility/accessibility-audit.js";
import { runSecurityAudit } from "../trust-security-accessibility/security-audit.js";
import { runTrustAudit } from "../trust-security-accessibility/trust-audit.js";
import { generateRoadmap } from "./audit-roadmap.js";
import { getQuickWins, getStrategicOpportunities } from "./audit-report-generator.js";
import { deduplicateIssues } from "./issue-deduplication.js";
import { runTemplateAudit } from "./template-audit.js";
import { calculateCategoryScore, calculateWebsiteScore, gradeFromScore } from "./website-score.js";
export function runWebsiteAudit(input) {
    if (!hasInput(input))
        return needsInput();
    if (input.url && !hasInput({ ...input, url: undefined }))
        return needsInput(["website", "pages", "manual audit data"]);
    const websiteType = detectWebsiteType(input);
    const businessGoal = detectBusinessGoal(input, websiteType);
    const rawIssues = [];
    const categoryFindings = [];
    const pageFindings = buildPageFindings(input);
    const template = runTemplateAudit(input.pages);
    rawIssues.push(...template.issues);
    runModule("technical-seo", rawIssues, categoryFindings, () => input.technical || input.pages?.length ? runTechnicalAudit({ mode: "website", url: input.url, html: input.pages?.[0]?.html, statusCode: input.technical?.statusCode ?? input.pages?.[0]?.statusCode, robotsTxt: input.technical?.robotsTxt, sitemapXml: input.technical?.sitemapXml, headers: input.technical?.headers, canonicalUrl: input.technical?.canonicalUrl ?? input.pages?.[0]?.canonicalUrl, links: input.technical?.links }) : undefined);
    runModule("performance-seo", rawIssues, categoryFindings, () => input.performance ? runPerformanceAudit({ mode: "website", url: input.url, html: input.pages?.[0]?.html, metrics: input.performance.metrics, assets: input.performance.assets, headers: input.performance.headers }) : undefined);
    runModule("on-page-seo", rawIssues, categoryFindings, () => input.onPage || input.pages?.length ? runOnPageAudit({ mode: "website", url: input.pages?.[0]?.url, html: input.pages?.[0]?.html, title: input.pages?.[0]?.title, metaDescription: input.pages?.[0]?.metaDescription, h1: input.pages?.[0]?.h1, bodyText: input.pages?.[0]?.bodyText, pageType: input.pages?.[0]?.pageType, primaryKeyword: input.pages?.[0]?.primaryKeyword, headings: input.onPage?.headings, images: input.onPage?.images, links: input.onPage?.links, ctas: input.onPage?.ctas }) : undefined);
    runModule("keyword-research-intent", rawIssues, categoryFindings, () => input.keywords ? runKeywordResearch({ mode: "audit", seedKeywords: input.keywords.seedKeywords, keywordMetrics: input.keywords.keywordMetrics, existingPages: input.keywords.existingPages }) : undefined);
    runModule("content-strategy-planning", rawIssues, categoryFindings, () => input.content ? runContentPlan({ mode: "audit", business: input.website, keywordClusters: input.content.keywordClusters, existingPages: input.content.existingPages, competitorPages: input.content.competitorPages, constraints: input.content.constraints }) : undefined);
    runModule("site-architecture-internal-linking", rawIssues, categoryFindings, () => input.architecture ? runArchitectureAudit({ mode: "audit", pages: input.architecture.pages, links: input.architecture.links, navigation: input.architecture.navigation, breadcrumbs: input.architecture.breadcrumbs, sitemapUrls: input.architecture.sitemapUrls, topicClusters: input.architecture.topicClusters }) : undefined);
    runModule("schema-entity-seo", rawIssues, categoryFindings, () => input.schema ? runSchemaAudit({ mode: "audit", html: input.pages?.[0]?.html, jsonLd: input.schema.jsonLd, page: input.pages?.[0], organization: input.schema.organization, author: input.schema.author, product: input.schema.product, service: input.schema.service, softwareApplication: input.schema.softwareApplication, localBusiness: input.schema.localBusiness, video: input.schema.video, jobPosting: input.schema.jobPosting }) : undefined);
    runModule("media-seo", rawIssues, categoryFindings, () => input.media ? runMediaAudit({ mode: "audit", html: input.pages?.[0]?.html, page: input.pages?.[0], images: input.media.images, videos: input.media.videos, openGraph: input.media.openGraph, assets: input.media.assets }) : undefined);
    if (websiteType === "ecommerce" || input.ecommerce)
        runModule("ecommerce-seo", rawIssues, categoryFindings, () => input.ecommerce ? runEcommerceAudit({ mode: "audit", page: input.pages?.[0], categories: input.ecommerce.categories, products: input.ecommerce.products, filters: input.ecommerce.filters, pagination: input.ecommerce.pagination, policies: input.ecommerce.policies, merchantFeed: input.ecommerce.merchantFeed, internalLinks: input.ecommerce.internalLinks }) : undefined);
    if (input.localInternational) {
        runModule("local-international-seo", rawIssues, categoryFindings, () => input.localInternational?.business || input.localInternational?.locations ? runLocalSEOAudit({ mode: "audit", business: input.localInternational.business, locations: input.localInternational.locations, googleBusinessProfile: input.localInternational.googleBusinessProfile, citations: input.localInternational.citations, reviews: input.localInternational.reviews, pages: input.pages }) : undefined);
        runModule("local-international-seo", rawIssues, categoryFindings, () => input.localInternational?.site || input.localInternational?.hreflangSets || input.localInternational?.localizedContent ? runInternationalSEOAudit({ mode: "audit", site: input.localInternational.site, pages: input.pages, hreflangSets: input.localInternational.hreflangSets, localizedContent: input.localInternational.localizedContent }) : undefined);
    }
    runModule("ai-search-discover-seo", rawIssues, categoryFindings, () => input.aiDiscover ? runAISearchAudit({ mode: "audit", page: input.pages?.[0], html: input.pages?.[0]?.html, content: input.aiDiscover.content, entities: input.aiDiscover.entities, queries: input.aiDiscover.queries }) : undefined);
    runModule("ai-search-discover-seo", rawIssues, categoryFindings, () => input.aiDiscover?.publisher || input.aiDiscover?.contentSignals ? runDiscoverSEOAudit({ mode: "discover", page: input.pages?.[0], publisher: input.aiDiscover.publisher, contentSignals: input.aiDiscover.contentSignals }) : undefined);
    if (input.trustSecurityAccessibility) {
        runModule("trust-security-accessibility", rawIssues, categoryFindings, () => runTrustAudit({ mode: "audit", page: input.pages?.[0], organization: input.trustSecurityAccessibility?.organization, authors: input.trustSecurityAccessibility?.authors, reviewers: input.trustSecurityAccessibility?.reviewers, trustPages: input.trustSecurityAccessibility?.trustPages, testimonials: input.trustSecurityAccessibility?.testimonials, caseStudies: input.trustSecurityAccessibility?.caseStudies }));
        runModule("trust-security-accessibility", rawIssues, categoryFindings, () => runSecurityAudit({ mode: "audit", page: input.pages?.[0], headers: input.trustSecurityAccessibility?.headers, resources: input.trustSecurityAccessibility?.resources, forms: input.trustSecurityAccessibility?.forms, securitySignals: input.trustSecurityAccessibility?.securitySignals }));
        runModule("trust-security-accessibility", rawIssues, categoryFindings, () => runAccessibilityAudit({ mode: "audit", page: input.pages?.[0], headings: input.trustSecurityAccessibility?.headings, images: input.trustSecurityAccessibility?.images, links: input.trustSecurityAccessibility?.links, buttons: input.trustSecurityAccessibility?.buttons, forms: input.trustSecurityAccessibility?.forms, accessibilitySignals: input.trustSecurityAccessibility?.accessibilitySignals }));
    }
    runModule("cms-framework-seo", rawIssues, categoryFindings, () => input.cmsFramework ? runFrameworkSEOAudit({ mode: "audit", html: input.pages?.[0]?.html, framework: input.cmsFramework.framework, cms: input.cmsFramework.cms, packageJson: input.cmsFramework.packageJson, frameworkConfig: input.cmsFramework.frameworkConfig, routes: input.cmsFramework.routes, build: input.cmsFramework.build, seoFiles: input.cmsFramework.seoFiles }) : undefined);
    addPageIssues(input.pages ?? [], rawIssues);
    const issues = deduplicateIssues(rawIssues);
    const categoryScores = {
        technicalSeo: calculateCategoryScore(issues, "technical-seo"),
        performanceSeo: calculateCategoryScore(issues, "performance-seo"),
        onPageSeo: calculateCategoryScore(issues, "on-page-seo"),
        contentSeo: Math.min(calculateCategoryScore(issues, "keyword-research-intent"), calculateCategoryScore(issues, "content-strategy-planning")),
        architectureInternalLinking: calculateCategoryScore(issues, "site-architecture-internal-linking"),
        schemaEntitySeo: calculateCategoryScore(issues, "schema-entity-seo"),
        mediaSeo: calculateCategoryScore(issues, "media-seo"),
        ecommerceSeo: websiteType === "ecommerce" || input.ecommerce ? calculateCategoryScore(issues, "ecommerce-seo") : null,
        localInternationalSeo: input.localInternational ? calculateCategoryScore(issues, "local-international-seo") : null,
        aiSearchDiscoverSeo: calculateCategoryScore(issues, "ai-search-discover-seo"),
        trustSecurityAccessibility: calculateCategoryScore(issues, "trust-security-accessibility"),
        cmsFrameworkSeo: calculateCategoryScore(issues, "cms-framework-seo")
    };
    const score = applyGlobalIssuePenalty(calculateWebsiteScore(categoryScores), issues);
    const roadmap = generateRoadmap(issues);
    return {
        skill: "website-audit",
        status: getMissingInputs(input).length ? "partial" : "completed",
        score,
        grade: gradeFromScore(score),
        summary: `Website audit completed from provided inputs. Found ${issues.length} deduplicated issue(s) across ${categoryFindings.length} module result(s).`,
        websiteType,
        businessGoal,
        categoryScores,
        criticalIssues: issues.filter((issue) => issue.priority === "P0"),
        quickWins: getQuickWins(issues),
        strategicOpportunities: getStrategicOpportunities(issues),
        categoryFindings,
        pageFindings,
        templateFindings: template.findings,
        issues,
        roadmap,
        missingInputs: getMissingInputs(input),
        nextActions: issues.length ? ["Fix P0 and P1 blockers first.", "Use the roadmap to sequence template, technical, content, and strategy work."] : ["Provide more audit data for deeper scoring."]
    };
}
export function parseWebsiteAuditInputFromText(rawInput) {
    const input = { mode: rawInput.includes("page-audit") ? "page" : "website" };
    const args = rawInput.replace(/^\/seo-master\s+(?:audit-website|website-audit|full-audit|page-audit)\s*/u, "").trim();
    if (/^https?:\/\//iu.test(args))
        input.url = args;
    for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "website")
            input.website = parseJsonFlag(value, undefined);
        if (key === "pages")
            input.pages = parseJsonFlag(value, []);
        if (key === "technical")
            input.technical = parseJsonFlag(value, undefined);
        if (key === "performance")
            input.performance = parseJsonFlag(value, undefined);
        if (key === "onPage" || key === "on-page")
            input.onPage = parseJsonFlag(value, undefined);
        if (key === "keywords")
            input.keywords = parseJsonFlag(value, undefined);
        if (key === "content")
            input.content = parseJsonFlag(value, undefined);
        if (key === "architecture")
            input.architecture = parseJsonFlag(value, undefined);
        if (key === "schema")
            input.schema = parseJsonFlag(value, undefined);
        if (key === "media")
            input.media = parseJsonFlag(value, undefined);
        if (key === "ecommerce")
            input.ecommerce = parseJsonFlag(value, undefined);
        if (key === "localInternational" || key === "local-international")
            input.localInternational = parseJsonFlag(value, undefined);
        if (key === "aiDiscover" || key === "ai-discover")
            input.aiDiscover = parseJsonFlag(value, undefined);
        if (key === "trustSecurityAccessibility" || key === "trust-security-accessibility")
            input.trustSecurityAccessibility = parseJsonFlag(value, undefined);
        if (key === "cmsFramework" || key === "cms-framework")
            input.cmsFramework = parseJsonFlag(value, undefined);
    }
    return input;
}
function runModule(sourceSkill, issues, findings, run) {
    const result = run();
    if (!result || result.status === "needs_input")
        return;
    findings.push(`${sourceSkill}: ${result.summary ?? "completed"}`);
    for (const item of result.issues ?? [])
        issues.push(convertIssue(item, sourceSkill));
}
function convertIssue(item, sourceSkill) {
    return {
        id: String(item.id ?? item.title ?? "issue"),
        category: String(item.category ?? sourceSkill),
        sourceSkill,
        title: String(item.title ?? "Audit issue"),
        priority: item.priority ?? "P2",
        problem: String(item.problem ?? ""),
        whyItMatters: String(item.whyItMatters ?? "This affects website SEO quality."),
        howToFix: String(item.howToFix ?? "Review and fix using provided evidence."),
        do: Array.isArray(item.do) ? item.do.map(String) : ["Use provided evidence"],
        dont: Array.isArray(item.dont) ? item.dont.map(String) : ["Do not invent findings"],
        evidence: Array.isArray(item.evidence) ? item.evidence.map(String) : [],
        appliesTo: ["website", "audit"]
    };
}
function addPageIssues(pages, issues) {
    for (const page of pages) {
        if (!page.title)
            issues.push(pageIssue("page-missing-title", "Missing title on provided page", "P1", page));
        if (!page.metaDescription)
            issues.push(pageIssue("page-missing-meta-description", "Missing meta description on provided page", "P2", page));
        if (!page.h1)
            issues.push(pageIssue("page-missing-h1", "Missing H1 on provided page", "P1", page));
        if (page.isIndexable === false && ["homepage", "service", "product", "category", "landing", "pricing"].includes(page.pageType ?? ""))
            issues.push(pageIssue("important-page-noindex", "Important page is noindex", "P1", page));
    }
}
function pageIssue(id, title, priority, page) {
    return { id, category: "page-audit", sourceSkill: "page-audit", title, priority, problem: page.url, whyItMatters: "Important pages need complete page-level SEO signals.", howToFix: "Add the missing page-level SEO field.", do: ["Audit important page types separately"], dont: ["Apply one page finding to the whole site without evidence"], evidence: [page.url], appliesTo: ["page", "audit"], affectedPages: [page.url], affectedTemplates: [page.pageType ?? "unknown"] };
}
function buildPageFindings(input) {
    return (input.pages ?? []).map((page) => `${page.url}: ${page.pageType ?? "unknown"}${page.importance ? ` (${page.importance})` : ""}`);
}
function detectWebsiteType(input) {
    if (input.website?.websiteType)
        return input.website.websiteType;
    if (input.ecommerce?.products?.length || input.ecommerce?.categories?.length || input.pages?.some((page) => ["product", "category"].includes(page.pageType ?? "")))
        return "ecommerce";
    if (input.localInternational?.business || input.localInternational?.locations?.length || input.pages?.some((page) => page.pageType === "local"))
        return "local_business";
    if (input.pages?.some((page) => ["blog", "article"].includes(page.pageType ?? "")))
        return "blog_news";
    if (input.pages?.some((page) => ["pricing", "documentation"].includes(page.pageType ?? "")) || input.cmsFramework?.framework === "nextjs")
        return "saas";
    if (input.pages?.some((page) => ["service", "contact", "about"].includes(page.pageType ?? "")))
        return "corporate";
    return "unknown";
}
function detectBusinessGoal(input, type) {
    if (input.website?.businessGoal)
        return input.website.businessGoal;
    if (type === "ecommerce")
        return "sales";
    if (type === "local_business")
        return "local_visits";
    if (type === "blog_news")
        return "content_traffic";
    if (type === "saas")
        return input.pages?.some((page) => page.pageType === "pricing") ? "demo_booking" : "signup";
    if (type === "corporate")
        return "lead_generation";
    return "unknown";
}
function hasInput(input) {
    return Boolean(input.url || input.website || input.pages?.length || input.technical || input.performance || input.onPage || input.keywords || input.content || input.architecture || input.schema || input.media || input.ecommerce || input.localInternational || input.aiDiscover || input.trustSecurityAccessibility || input.cmsFramework);
}
function getMissingInputs(input) {
    const missing = [];
    for (const key of ["website", "pages", "technical", "performance", "onPage", "keywords", "content", "architecture", "schema", "media", "ecommerce", "localInternational", "aiDiscover", "trustSecurityAccessibility", "cmsFramework"]) {
        if (!input[key])
            missing.push(key);
    }
    return missing;
}
function needsInput(missingInputs = ["website", "pages", "technical", "performance", "onPage", "schema", "media", "manual audit data"]) {
    return { skill: "website-audit", status: "needs_input", score: 0, grade: "F", summary: "Needs input. Provide website data, pages, HTML, technical, performance, on-page, schema, media, ecommerce, local/international, trust/security/accessibility, CMS/framework, or manual audit data.", websiteType: "unknown", businessGoal: "unknown", categoryScores: { technicalSeo: 0, performanceSeo: 0, onPageSeo: 0, contentSeo: 0, architectureInternalLinking: 0, schemaEntitySeo: 0, mediaSeo: 0, ecommerceSeo: null, localInternationalSeo: null, aiSearchDiscoverSeo: 0, trustSecurityAccessibility: 0, cmsFrameworkSeo: 0 }, criticalIssues: [], quickWins: [], strategicOpportunities: [], categoryFindings: [], pageFindings: [], templateFindings: [], issues: [], roadmap: { first7Days: [], first30Days: [], days31To60: [], days61To90: [] }, missingInputs, nextActions: ["Provide explicit website audit inputs.", "No live crawling, Search Console, Lighthouse, ranking, analytics, or external validation was performed."] };
}
function applyGlobalIssuePenalty(score, issues) {
    const penalty = issues.reduce((sum, issue) => sum + ({ P0: 15, P1: 3, P2: 1, P3: 0 }[issue.priority]), 0);
    return Math.max(0, score - penalty);
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value.replace(/\\"/gu, "\""));
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=website-audit.js.map