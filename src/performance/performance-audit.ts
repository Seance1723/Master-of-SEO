import { checkAssetOptimization } from "./asset-optimization.ts";
import { checkCoreWebVitals } from "./core-web-vitals.ts";
import { checkCssPerformance } from "./css-performance.ts";
import { checkFontPerformance } from "./font-performance.ts";
import { checkImagePerformance } from "./image-performance.ts";
import { checkJavaScriptPerformance } from "./javascript-performance.ts";
import { buildPerformanceRecommendations } from "./performance-recommendations.ts";
import { checkServerResponse } from "./server-response.ts";
import { checkThirdPartyScripts } from "./third-party-scripts.ts";
import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceAuditOutput } from "../types/performance.ts";

export function runPerformanceAudit(input: PerformanceAuditInput): PerformanceAuditOutput {
  const normalized: PerformanceAuditInput = { ...input, mode: input.mode ?? "planning" };
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

export function parsePerformanceAuditInputFromText(rawInput: string): PerformanceAuditInput {
  const input: PerformanceAuditInput = { mode: "planning" };
  const args = rawInput.replace(/^\/seo-master\s+performance-audit\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "url") input.url = value;
    if (key === "html") input.html = value;
    if (key === "metrics") input.metrics = parseJsonFlag(value, {});
    if (key === "assets") input.assets = parseJsonFlag(value, []);
    if (key === "headers") input.headers = parseJsonFlag(value, {});
    if (key === "mode" && ["website", "page", "code", "planning"].includes(value)) input.mode = value as PerformanceAuditInput["mode"];
  }

  const withoutFlags = args.replace(flagPattern, "").trim();
  if (!input.url && /^https?:\/\//iu.test(withoutFlags)) input.url = withoutFlags.split(/\s+/u)[0];
  return input;
}

function parseJsonFlag<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function hasAnyAuditInput(input: PerformanceAuditInput): boolean {
  return Boolean(input.url || input.html || input.headers || input.assets?.length || hasMetric(input.metrics));
}

function hasMetric(metrics?: PerformanceAuditInput["metrics"]): boolean {
  return Boolean(metrics && Object.values(metrics).some((value) => value !== undefined));
}

function getMissingInputs(input: PerformanceAuditInput): string[] {
  const missing: string[] = [];
  if (!input.html) missing.push("html");
  if (!input.assets?.length) missing.push("assets");
  if (!hasMetric(input.metrics)) missing.push("metrics");
  if (!input.headers) missing.push("headers");
  return missing;
}

function pickMetrics(input: PerformanceAuditInput): PerformanceAuditOutput["metrics"] {
  return {
    lcp: input.metrics?.lcp ?? null,
    inp: input.metrics?.inp ?? null,
    cls: input.metrics?.cls ?? null,
    ttfb: input.metrics?.ttfb ?? null
  };
}

function calculatePerformanceScore(issues: PerformanceAuditIssue[]): number {
  const penalties = { P0: 30, P1: 15, P2: 7, P3: 3 };
  const totalPenalty = issues.reduce((sum, issue) => sum + penalties[issue.priority], 0);
  return Math.max(0, 100 - totalPenalty);
}

function summarize(status: PerformanceAuditOutput["status"], issues: PerformanceAuditIssue[], missingInputs: string[]): string {
  if (status === "needs_input") return "Needs input. Provide URL, HTML, metrics, assets, headers, or Lighthouse-style data.";
  const prefix = status === "partial" ? "Partial performance audit completed from provided inputs" : "Performance audit completed";
  return `${prefix}. Found ${issues.length} issue(s). Missing inputs: ${missingInputs.join(", ") || "none"}.`;
}

function checkHtmlPerformance(input: PerformanceAuditInput): { issues: PerformanceAuditIssue[]; passedChecks: string[] } {
  const html = input.html;
  if (!html) return { issues: [], passedChecks: [] };
  const issues: PerformanceAuditIssue[] = [];
  const iframes = (html.match(/<iframe\b/giu) ?? []).length;
  if (iframes > 0) issues.push(htmlIssue("html-iframe-embeds", "Iframe embeds found", "P3", `${iframes} iframe embed(s) found.`));
  if ((input.assets ?? []).some((asset) => asset.type === "video" && asset.position === "above_fold")) {
    issues.push(htmlIssue("video-above-fold", "Above-fold video asset found", "P2", "Video asset is marked above_fold."));
  }
  return { issues, passedChecks: issues.length ? [] : ["HTML performance checks passed."] };
}

function htmlIssue(id: string, title: string, priority: "P2" | "P3", evidence: string): PerformanceAuditIssue {
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
