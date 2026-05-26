import { detectCannibalization } from "./cannibalization.js";
import { clusterKeywords, normalizeKeywords } from "./keyword-clustering.js";
import { mapClustersToPages } from "./keyword-page-map.js";
import { buildKeywordRecommendations } from "./keyword-recommendations.js";
import { findOpportunities } from "./opportunity-prioritizer.js";
import { serpIntentAssumptionIssue } from "./serp-intent-guard.js";
export function runKeywordResearch(input) {
    const normalizedInput = { ...input, mode: input.mode ?? "research" };
    const missingInputs = getMissingInputs(normalizedInput);
    if (!hasAnyKeywordInput(normalizedInput)) {
        return {
            skill: "keyword-research-intent",
            status: "needs_input",
            score: 0,
            summary: "Needs input. Provide seed keywords, business context, competitor keywords, existing pages, or keyword metrics.",
            clusters: [],
            issues: [],
            keywordMap: [],
            cannibalizationRisks: [],
            opportunities: [],
            missingInputs,
            nextActions: ["Provide seed keywords, competitor keywords, existing pages, services/products, or keyword metrics.", "No live keyword API fetching was performed."]
        };
    }
    const allKeywordInputs = [
        ...(normalizedInput.seedKeywords ?? []),
        ...(normalizedInput.competitorKeywords ?? []),
        ...(normalizedInput.keywordMetrics ?? []).map((metric) => metric.keyword),
        ...(normalizedInput.existingPages ?? []).flatMap((page) => [page.targetKeyword, ...(page.rankingKeywords ?? [])].filter(Boolean)),
        ...(normalizedInput.business?.services ?? []),
        ...(normalizedInput.business?.products ?? [])
    ];
    const normalized = normalizeKeywords(allKeywordInputs);
    const clusters = clusterKeywords(normalized, normalizedInput.keywordMetrics ?? [], normalizedInput.business);
    const keywordMap = mapClustersToPages(clusters, normalizedInput.existingPages);
    const cannibalizationRisks = detectCannibalization(normalizedInput.existingPages, clusters);
    const opportunities = findOpportunities(clusters, normalizedInput.keywordMetrics ?? [], normalizedInput.competitorKeywords ?? []);
    const issues = [
        ...serpIntentAssumptionIssue(false),
        ...cannibalizationRisks.map((risk) => ({
            id: "keyword-cannibalization-risk",
            category: "cannibalization",
            title: "Keyword cannibalization risk",
            priority: "P1",
            problem: `${risk.keyword} maps to multiple URLs.`,
            whyItMatters: "Multiple pages targeting the same keyword or intent can split signals and confuse ranking.",
            howToFix: `Recommended action: ${risk.recommendation}.`,
            do: ["Detect when multiple pages target the same keyword or intent", "Preserve stronger pages"],
            dont: ["Create duplicate service/blog pages", "Target the same BOFU term across many pages"],
            evidence: risk.urls,
            appliesTo: ["keyword", "content", "planning", "audit"]
        }))
    ];
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "keyword-research-intent",
        status,
        score: calculateKeywordScore(issues, opportunities),
        summary: `${status === "partial" ? "Partial keyword research completed" : "Keyword research completed"}. Created ${clusters.length} cluster(s), ${keywordMap.length} map item(s), and ${opportunities.length} opportunity item(s).`,
        clusters,
        issues,
        keywordMap,
        cannibalizationRisks,
        opportunities,
        missingInputs,
        nextActions: buildKeywordRecommendations(issues, opportunities, missingInputs)
    };
}
export function parseKeywordResearchInputFromText(rawInput) {
    const input = { mode: "research" };
    const args = rawInput.replace(/^\/seo-master\s+keyword-research\s*/u, "").trim();
    const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
    for (const match of args.matchAll(flagPattern)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "seedKeywords" || key === "seed-keywords")
            input.seedKeywords = parseKeywordList(value);
        if (key === "competitorKeywords" || key === "competitor-keywords")
            input.competitorKeywords = parseKeywordList(value);
        if (key === "business")
            input.business = parseJsonFlag(value, {});
        if (key === "existingPages" || key === "existing-pages")
            input.existingPages = parseJsonFlag(value, []);
        if (key === "keywordMetrics" || key === "keyword-metrics")
            input.keywordMetrics = parseJsonFlag(value, []);
        if (key === "mode" && ["research", "clustering", "mapping", "planning", "audit"].includes(value))
            input.mode = value;
    }
    const plain = args.replace(flagPattern, "").trim();
    if (!input.seedKeywords?.length && plain)
        input.seedKeywords = parseKeywordList(plain);
    return input;
}
function parseKeywordList(value) {
    const parsed = parseJsonFlag(value, undefined);
    if (Array.isArray(parsed))
        return parsed.map(String);
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
function hasAnyKeywordInput(input) {
    return Boolean(input.seedKeywords?.length || input.competitorKeywords?.length || input.existingPages?.length || input.keywordMetrics?.length || input.business?.services?.length || input.business?.products?.length);
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.seedKeywords?.length)
        missing.push("seedKeywords");
    if (!input.competitorKeywords?.length)
        missing.push("competitorKeywords");
    if (!input.existingPages?.length)
        missing.push("existingPages");
    if (!input.business)
        missing.push("business");
    if (!input.keywordMetrics?.length)
        missing.push("keywordMetrics");
    return missing;
}
function calculateKeywordScore(issues, opportunities) {
    const penalty = issues.reduce((sum, issue) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[issue.priority]), 0);
    return Math.max(0, Math.min(100, 80 + Math.min(20, opportunities.length * 2) - penalty));
}
//# sourceMappingURL=keyword-research.js.map