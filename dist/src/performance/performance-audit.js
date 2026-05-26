import { checkAssetOptimization } from "./asset-optimization.js";
import { checkCoreWebVitals } from "./core-web-vitals.js";
import { checkCssPerformance } from "./css-performance.js";
import { checkFontPerformance } from "./font-performance.js";
import { checkImagePerformance } from "./image-performance.js";
import { checkJavaScriptPerformance } from "./javascript-performance.js";
import { buildPerformanceRecommendations } from "./performance-recommendations.js";
import { checkServerResponse } from "./server-response.js";
import { checkThirdPartyScripts } from "./third-party-scripts.js";
export function runPerformanceAudit(input) {
    const normalized = { ...input, mode: input.mode ?? "planning" };
    const missingInputs = getMissingInputs(normalized);
    if (!hasAnyAuditInput(normalized)) {
        return {
            skill: "performance-seo",
            status: "needs_input",
            score: 0,
            summary: "Needs input. Provide URL, HTML, metrics, assets, headers, or Lighthouse-style data.",
            metrics: pickMetrics(normalized),
            issues: [],
            passedChecks: [],
            missingInputs,
            nextActions: [
                "Provide at least one audit input: url, html, metrics, assets, or headers.",
                "No live Lighthouse crawl was performed."
            ]
        };
    }
    const checks = [
        checkCoreWebVitals(normalized),
        checkServerResponse(normalized),
        checkImagePerformance(normalized),
        checkJavaScriptPerformance(normalized),
        checkCssPerformance(normalized),
        checkFontPerformance(normalized),
        checkThirdPartyScripts(normalized),
        checkAssetOptimization(normalized),
        checkHtmlPerformance(normalized)
    ];
    const issues = checks.flatMap((check) => check.issues);
    const passedChecks = checks.flatMap((check) => check.passedChecks);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "performance-seo",
        status,
        score: calculatePerformanceScore(issues),
        summary: summarize(status, issues, missingInputs),
        metrics: pickMetrics(normalized),
        issues,
        passedChecks,
        missingInputs,
        nextActions: buildPerformanceRecommendations(issues, missingInputs)
    };
}
export function parsePerformanceAuditInputFromText(rawInput) {
    const input = { mode: "planning" };
    const args = rawInput.replace(/^\/seo-master\s+performance-audit\s*/u, "").trim();
    const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
    for (const match of args.matchAll(flagPattern)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "html")
            input.html = value;
        if (key === "metrics")
            input.metrics = parseJsonFlag(value, {});
        if (key === "assets")
            input.assets = parseJsonFlag(value, []);
        if (key === "headers")
            input.headers = parseJsonFlag(value, {});
        if (key === "mode" && ["website", "page", "code", "planning"].includes(value))
            input.mode = value;
    }
    const withoutFlags = args.replace(flagPattern, "").trim();
    if (!input.url && /^https?:\/\//iu.test(withoutFlags))
        input.url = withoutFlags.split(/\s+/u)[0];
    return input;
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
function hasAnyAuditInput(input) {
    return Boolean(input.url || input.html || input.headers || input.assets?.length || hasMetric(input.metrics));
}
function hasMetric(metrics) {
    return Boolean(metrics && Object.values(metrics).some((value) => value !== undefined));
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.html)
        missing.push("html");
    if (!input.assets?.length)
        missing.push("assets");
    if (!hasMetric(input.metrics))
        missing.push("metrics");
    if (!input.headers)
        missing.push("headers");
    return missing;
}
function pickMetrics(input) {
    return {
        lcp: input.metrics?.lcp ?? null,
        inp: input.metrics?.inp ?? null,
        cls: input.metrics?.cls ?? null,
        ttfb: input.metrics?.ttfb ?? null
    };
}
function calculatePerformanceScore(issues) {
    const penalties = { P0: 30, P1: 15, P2: 7, P3: 3 };
    const totalPenalty = issues.reduce((sum, issue) => sum + penalties[issue.priority], 0);
    return Math.max(0, 100 - totalPenalty);
}
function summarize(status, issues, missingInputs) {
    if (status === "needs_input")
        return "Needs input. Provide URL, HTML, metrics, assets, headers, or Lighthouse-style data.";
    const prefix = status === "partial" ? "Partial performance audit completed from provided inputs" : "Performance audit completed";
    return `${prefix}. Found ${issues.length} issue(s). Missing inputs: ${missingInputs.join(", ") || "none"}.`;
}
function checkHtmlPerformance(input) {
    const html = input.html;
    if (!html)
        return { issues: [], passedChecks: [] };
    const issues = [];
    const iframes = (html.match(/<iframe\b/giu) ?? []).length;
    if (iframes > 0)
        issues.push(htmlIssue("html-iframe-embeds", "Iframe embeds found", "P3", `${iframes} iframe embed(s) found.`));
    if ((input.assets ?? []).some((asset) => asset.type === "video" && asset.position === "above_fold")) {
        issues.push(htmlIssue("video-above-fold", "Above-fold video asset found", "P2", "Video asset is marked above_fold."));
    }
    return { issues, passedChecks: issues.length ? [] : ["HTML performance checks passed."] };
}
function htmlIssue(id, title, priority, evidence) {
    return {
        id,
        category: "html-performance",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Embeds and heavy above-fold media can delay rendering and interaction.",
        howToFix: "Lazy-load non-critical embeds and avoid heavy above-fold media unless essential.",
        do: ["Delay non-critical embeds", "Reserve space for dynamic media", "Prioritize above-fold rendering"],
        dont: ["Load heavy embeds above the fold without need", "Allow embeds to shift layout"],
        evidence: [evidence],
        appliesTo: ["website", "page", "performance", "audit"]
    };
}
//# sourceMappingURL=performance-audit.js.map