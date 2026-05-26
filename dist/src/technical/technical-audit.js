import { checkCanonicalization } from "./canonicalization.js";
import { checkCrawlability } from "./crawlability.js";
import { checkIndexability } from "./indexability.js";
import { checkMetaRobots } from "./meta-robots.js";
import { checkRedirects } from "./redirects.js";
import { checkRobotsTxt } from "./robots-txt.js";
import { checkSitemap } from "./sitemap.js";
import { checkStatusCode } from "./status-codes.js";
import { checkUrlStructure } from "./url-structure.js";
import { checkXRobotsTag } from "./x-robots-tag.js";
export function runTechnicalAudit(input) {
    const normalized = { ...input, mode: input.mode ?? "planning" };
    const missingInputs = getMissingInputs(normalized);
    if (!hasAnyAuditInput(normalized)) {
        return {
            skill: "technical-seo",
            status: "needs_input",
            score: 0,
            summary: "Needs input. Provide URL, HTML, robots.txt, sitemap XML, headers, or status code.",
            issues: [],
            passedChecks: [],
            missingInputs,
            nextActions: [
                "Provide at least one audit input: url, html, robotsTxt, sitemapXml, headers, or statusCode.",
                "No live crawling was performed."
            ]
        };
    }
    const checks = [
        checkRobotsTxt(normalized),
        checkMetaRobots(normalized),
        checkXRobotsTag(normalized),
        checkCanonicalization(normalized),
        checkSitemap(normalized),
        checkStatusCode(normalized),
        checkRedirects(normalized),
        checkUrlStructure(normalized),
        checkCrawlability(normalized)
    ];
    const meta = checks[1];
    const xRobots = checks[2];
    checks.push(checkIndexability(normalized, meta.hasNoindex || xRobots.hasNoindex));
    const issues = checks.flatMap((check) => check.issues);
    const passedChecks = checks.flatMap((check) => check.passedChecks);
    const score = calculateTechnicalScore(issues);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "technical-seo",
        status,
        score,
        summary: summarize(status, issues, missingInputs),
        issues,
        passedChecks,
        missingInputs,
        nextActions: buildNextActions(issues, missingInputs)
    };
}
export function parseTechnicalAuditInputFromText(rawInput) {
    const input = { mode: "planning" };
    const args = rawInput.replace(/^\/seo-master\s+technical-audit\s*/u, "").trim();
    const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
    for (const match of args.matchAll(flagPattern)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "html")
            input.html = value;
        if (key === "robotsTxt" || key === "robots-txt")
            input.robotsTxt = value;
        if (key === "sitemapXml" || key === "sitemap-xml")
            input.sitemapXml = value;
        if (key === "statusCode" || key === "status-code")
            input.statusCode = Number(value);
        if (key === "canonicalUrl" || key === "canonical-url")
            input.canonicalUrl = value;
        if (key === "mode" && ["website", "page", "code", "planning"].includes(value))
            input.mode = value;
    }
    const withoutFlags = args.replace(flagPattern, "").trim();
    if (!input.url && /^https?:\/\//iu.test(withoutFlags))
        input.url = withoutFlags.split(/\s+/u)[0];
    return input;
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.html)
        missing.push("html");
    if (!input.robotsTxt)
        missing.push("robotsTxt");
    if (!input.sitemapXml)
        missing.push("sitemapXml");
    if (!input.headers)
        missing.push("headers");
    if (!input.statusCode)
        missing.push("statusCode");
    return missing;
}
function hasAnyAuditInput(input) {
    return Boolean(input.url || input.html || input.robotsTxt || input.sitemapXml || input.headers || input.statusCode || input.canonicalUrl || input.links?.length || input.pages?.length);
}
function calculateTechnicalScore(issues) {
    const penalties = { P0: 30, P1: 15, P2: 7, P3: 3 };
    const totalPenalty = issues.reduce((sum, issue) => sum + penalties[issue.priority], 0);
    return Math.max(0, 100 - totalPenalty);
}
function summarize(status, issues, missingInputs) {
    if (status === "needs_input")
        return "Needs input. Provide URL, HTML, robots.txt, sitemap XML, headers, or status code.";
    const prefix = status === "partial" ? "Partial technical audit completed from provided inputs" : "Technical audit completed";
    return `${prefix}. Found ${issues.length} issue(s). Missing inputs: ${missingInputs.join(", ") || "none"}.`;
}
function buildNextActions(issues, missingInputs) {
    const actions = [];
    if (missingInputs.length)
        actions.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
    const critical = issues.filter((issue) => issue.priority === "P0" || issue.priority === "P1");
    if (critical.length)
        actions.push("Fix P0/P1 technical issues first.");
    actions.push("No live crawling was performed; results are limited to supplied inputs.");
    return actions;
}
//# sourceMappingURL=technical-audit.js.map