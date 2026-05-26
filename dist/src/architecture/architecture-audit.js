import { checkAnchorText } from "./anchor-text.js";
import { buildArchitectureRecommendations } from "./architecture-recommendations.js";
import { checkBreadcrumbs } from "./breadcrumbs.js";
import { calculateDepthIssues } from "./crawl-depth.js";
import { buildLinkGraph } from "./internal-linking.js";
import { recommendLinkEquity } from "./link-equity.js";
import { checkNavigation } from "./navigation-structure.js";
import { detectOrphanPages } from "./orphan-pages.js";
import { checkTopicClusterLinking } from "./topic-cluster-linking.js";
import { checkUrlHierarchy } from "./url-hierarchy.js";
import { normalizeUrl } from "./url-utils.js";
export function runArchitectureAudit(input) {
    const normalized = { ...input, mode: input.mode ?? "audit" };
    const missingInputs = getMissingInputs(normalized);
    if (!hasAnyInput(normalized))
        return needsInput(missingInputs);
    const graph = buildLinkGraph(normalized);
    const orphan = detectOrphanPages(normalized, graph);
    const crawlDepthIssues = calculateDepthIssues(normalized, graph);
    const anchorTextIssues = checkAnchorText(normalized);
    const breadcrumbIssues = checkBreadcrumbs(normalized);
    const topicClusterLinkingIssues = checkTopicClusterLinking(normalized);
    const navigationIssues = checkNavigation(normalized, graph);
    const hierarchyIssues = checkUrlHierarchy(normalized);
    const internalIssues = checkInternalLinking(normalized, graph);
    const issues = [...orphan.issues, ...crawlDepthIssues, ...anchorTextIssues, ...breadcrumbIssues, ...topicClusterLinkingIssues, ...navigationIssues, ...hierarchyIssues, ...internalIssues];
    const recommendations = [...recommendLinkEquity(normalized, graph), ...buildArchitectureRecommendations(normalized, issues, missingInputs)];
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "site-architecture-internal-linking",
        status,
        score: score(issues),
        summary: `${status === "partial" ? "Partial architecture audit completed" : "Architecture audit completed"}. Found ${issues.length} issue(s), ${orphan.orphanPages.length} orphan page(s), and ${crawlDepthIssues.length} crawl depth issue(s).`,
        architectureFindings: [`Pages reviewed: ${normalized.pages?.length ?? 0}`, `Navigation items reviewed: ${normalized.navigation?.length ?? 0}`],
        internalLinkingFindings: [`Links reviewed: ${normalized.links?.length ?? 0}`, `Link type distribution: ${JSON.stringify(graph.distribution)}`],
        orphanPages: orphan.orphanPages,
        crawlDepthIssues,
        anchorTextIssues,
        breadcrumbIssues,
        topicClusterLinkingIssues,
        recommendations,
        issues,
        missingInputs,
        nextActions: recommendations
    };
}
export function parseArchitectureAuditInputFromText(rawInput) {
    const input = { mode: "audit" };
    const args = rawInput.replace(/^\/seo-master\s+(?:architecture-audit|internal-linking-audit)\s*/u, "").trim();
    const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
    for (const match of args.matchAll(flagPattern)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "pages")
            input.pages = parseJsonFlag(value, []);
        if (key === "links")
            input.links = parseJsonFlag(value, []);
        if (key === "navigation")
            input.navigation = parseJsonFlag(value, []);
        if (key === "breadcrumbs")
            input.breadcrumbs = parseJsonFlag(value, []);
        if (key === "sitemapUrls" || key === "sitemap-urls")
            input.sitemapUrls = parseJsonFlag(value, []);
        if (key === "topicClusters" || key === "topic-clusters")
            input.topicClusters = parseJsonFlag(value, []);
        if (key === "mode" && ["audit", "planning", "linking", "architecture"].includes(value))
            input.mode = value;
    }
    return input;
}
function checkInternalLinking(input, graph) {
    const issues = [];
    for (const page of input.pages ?? []) {
        const url = normalizeUrl(page.url);
        const incoming = graph.incoming.get(url) ?? [];
        if (["critical", "high"].includes(page.importance ?? "") && incoming.length < 3)
            issues.push(issue("important-page-too-few-internal-links", "Important page has too few incoming links", "P2", `${page.url} incoming=${incoming.length}`));
        if (["bofu"].includes(page.funnelStage ?? "") || ["service", "product", "pricing"].includes(page.pageType ?? "")) {
            if (!incoming.some((link) => link.linkType === "contextual"))
                issues.push(issue("commercial-page-no-contextual-links", "Commercial/BOFU page has no contextual incoming links", page.importance === "critical" ? "P1" : "P2", page.url));
        }
        if (page.intent === "informational") {
            const outgoing = graph.outgoing.get(url) ?? [];
            if (!outgoing.some((link) => ["service", "product", "pricing", "landing"].some((part) => link.to.includes(part))))
                issues.push(issue("informational-page-no-commercial-links", "Informational page has no commercial internal links", "P2", page.url));
        }
    }
    for (const link of input.links ?? [])
        if (link.isFollowed === false)
            issues.push(issue("nofollow-internal-link", "Nofollow internal link found", "P2", `${link.from} -> ${link.to}`));
    return issues;
}
function issue(id, title, priority, evidence) {
    return { id, category: "internal-linking", title, priority, problem: evidence, whyItMatters: "Internal links distribute discovery, context, and authority to important pages.", howToFix: "Add relevant followed contextual links with descriptive anchor text.", do: ["Use descriptive internal anchor text", "Link informational pages to commercial pages", "Add contextual links inside content body"], dont: ["Nofollow normal internal links", "Use click here everywhere", "Link to irrelevant pages"], evidence: [evidence], appliesTo: ["architecture", "internal_linking", "crawlability", "audit"] };
}
function needsInput(missingInputs) {
    return { skill: "site-architecture-internal-linking", status: "needs_input", score: 0, summary: "Needs input. Provide pages, links, navigation, breadcrumbs, sitemap URLs, or topic clusters.", architectureFindings: [], internalLinkingFindings: [], orphanPages: [], crawlDepthIssues: [], anchorTextIssues: [], breadcrumbIssues: [], topicClusterLinkingIssues: [], recommendations: [], issues: [], missingInputs, nextActions: ["Provide pages, links, navigation, breadcrumbs, sitemapUrls, or topicClusters.", "No live crawling was performed."] };
}
function hasAnyInput(input) {
    return Boolean(input.pages?.length || input.links?.length || input.navigation?.length || input.breadcrumbs?.length || input.sitemapUrls?.length || input.topicClusters?.length);
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.pages?.length)
        missing.push("pages");
    if (!input.links?.length)
        missing.push("links");
    if (!input.navigation?.length)
        missing.push("navigation");
    if (!input.breadcrumbs?.length)
        missing.push("breadcrumbs");
    if (!input.sitemapUrls?.length)
        missing.push("sitemapUrls");
    if (!input.topicClusters?.length)
        missing.push("topicClusters");
    return missing;
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value);
    }
    catch {
        try {
            return JSON.parse(value.replace(/\\"/gu, "\""));
        }
        catch {
            return fallback;
        }
    }
}
function score(issues) {
    return Math.max(0, 100 - issues.reduce((sum, item) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[item.priority]), 0));
}
//# sourceMappingURL=architecture-audit.js.map