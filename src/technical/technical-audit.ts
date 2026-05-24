import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalAuditOutput } from "../types/technical.ts";
import { checkCanonicalization } from "./canonicalization.ts";
import { checkCrawlability } from "./crawlability.ts";
import { checkIndexability } from "./indexability.ts";
import { checkMetaRobots } from "./meta-robots.ts";
import { checkRedirects } from "./redirects.ts";
import { checkRobotsTxt } from "./robots-txt.ts";
import { checkSitemap } from "./sitemap.ts";
import { checkStatusCode } from "./status-codes.ts";
import { checkUrlStructure } from "./url-structure.ts";
import { checkXRobotsTag } from "./x-robots-tag.ts";

export function runTechnicalAudit(input: TechnicalAuditInput): TechnicalAuditOutput {
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

  const meta = checks[1] as ReturnType<typeof checkMetaRobots>;
  const xRobots = checks[2] as ReturnType<typeof checkXRobotsTag>;
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

export function parseTechnicalAuditInputFromText(rawInput: string): TechnicalAuditInput {
  const input: TechnicalAuditInput = { mode: "planning" };
  const args = rawInput.replace(/^\/seo-master\s+technical-audit\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "url") input.url = value;
    if (key === "html") input.html = value;
    if (key === "robotsTxt" || key === "robots-txt") input.robotsTxt = value;
    if (key === "sitemapXml" || key === "sitemap-xml") input.sitemapXml = value;
    if (key === "statusCode" || key === "status-code") input.statusCode = Number(value);
    if (key === "canonicalUrl" || key === "canonical-url") input.canonicalUrl = value;
    if (key === "mode" && ["website", "page", "code", "planning"].includes(value)) input.mode = value as TechnicalAuditInput["mode"];
  }

  const withoutFlags = args.replace(flagPattern, "").trim();
  if (!input.url && /^https?:\/\//iu.test(withoutFlags)) input.url = withoutFlags.split(/\s+/u)[0];
  return input;
}

function getMissingInputs(input: TechnicalAuditInput): string[] {
  const missing: string[] = [];
  if (!input.html) missing.push("html");
  if (!input.robotsTxt) missing.push("robotsTxt");
  if (!input.sitemapXml) missing.push("sitemapXml");
  if (!input.headers) missing.push("headers");
  if (!input.statusCode) missing.push("statusCode");
  return missing;
}

function hasAnyAuditInput(input: TechnicalAuditInput): boolean {
  return Boolean(input.url || input.html || input.robotsTxt || input.sitemapXml || input.headers || input.statusCode || input.canonicalUrl || input.links?.length || input.pages?.length);
}

function calculateTechnicalScore(issues: TechnicalAuditIssue[]): number {
  const penalties = { P0: 30, P1: 15, P2: 7, P3: 3 };
  const totalPenalty = issues.reduce((sum, issue) => sum + penalties[issue.priority], 0);
  return Math.max(0, 100 - totalPenalty);
}

function summarize(status: TechnicalAuditOutput["status"], issues: TechnicalAuditIssue[], missingInputs: string[]): string {
  if (status === "needs_input") return "Needs input. Provide URL, HTML, robots.txt, sitemap XML, headers, or status code.";
  const prefix = status === "partial" ? "Partial technical audit completed from provided inputs" : "Technical audit completed";
  return `${prefix}. Found ${issues.length} issue(s). Missing inputs: ${missingInputs.join(", ") || "none"}.`;
}

function buildNextActions(issues: TechnicalAuditIssue[], missingInputs: string[]): string[] {
  const actions = [];
  if (missingInputs.length) actions.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
  const critical = issues.filter((issue) => issue.priority === "P0" || issue.priority === "P1");
  if (critical.length) actions.push("Fix P0/P1 technical issues first.");
  actions.push("No live crawling was performed; results are limited to supplied inputs.");
  return actions;
}
