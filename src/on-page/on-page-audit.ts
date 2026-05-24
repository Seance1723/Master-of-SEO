import { checkAboveTheFold } from "./above-the-fold.ts";
import { checkContentStructure } from "./content-structure.ts";
import { checkCtaConversion } from "./cta-conversion.ts";
import { checkHeadings } from "./headings.ts";
import { checkImageAlt } from "./image-alt.ts";
import { checkMetaDescription } from "./meta-description.ts";
import { checkOnPageLinks } from "./on-page-links.ts";
import { buildOnPageRecommendations } from "./on-page-recommendations.ts";
import { checkTitleTag } from "./title-tag.ts";
import type { OnPageAuditInput, OnPageAuditIssue, OnPageAuditOutput, OnPageCta, OnPageHeading, OnPageImage, OnPageLink } from "../types/on-page.ts";

export function runOnPageAudit(input: OnPageAuditInput): OnPageAuditOutput {
  const normalized = normalizeInput(input);
  const missingInputs = getMissingInputs(normalized);
  if (!hasAnyAuditInput(normalized)) {
    return {
      skill: "on-page-seo",
      status: "needs_input",
      score: 0,
      summary: "Needs input. Provide HTML, title, meta description, headings, body text, images, links, CTAs, or keyword data.",
      issues: [],
      passedChecks: [],
      missingInputs,
      nextActions: ["Provide at least one on-page input.", "No live crawling was performed."]
    };
  }

  const checks = [
    checkTitleTag(normalized),
    checkMetaDescription(normalized),
    checkHeadings(normalized),
    checkContentStructure(normalized),
    checkAboveTheFold(normalized),
    checkCtaConversion(normalized),
    checkImageAlt(normalized),
    checkOnPageLinks(normalized)
  ];
  const issues = checks.flatMap((check) => check.issues);
  const passedChecks = checks.flatMap((check) => check.passedChecks);
  const status = missingInputs.length ? "partial" : "completed";
  return {
    skill: "on-page-seo",
    status,
    score: calculateScore(issues),
    summary: `${status === "partial" ? "Partial on-page audit completed" : "On-page audit completed"}. Found ${issues.length} issue(s). Missing inputs: ${missingInputs.join(", ") || "none"}.`,
    issues,
    passedChecks,
    missingInputs,
    nextActions: buildOnPageRecommendations(issues, missingInputs)
  };
}

export function parseOnPageAuditInputFromText(rawInput: string): OnPageAuditInput {
  const input: OnPageAuditInput = { mode: "planning" };
  const args = rawInput.replace(/^\/seo-master\s+on-page-audit\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "url") input.url = value;
    if (key === "html") input.html = value;
    if (key === "title") input.title = value;
    if (key === "metaDescription" || key === "meta-description") input.metaDescription = value;
    if (key === "h1") input.h1 = value;
    if (key === "bodyText" || key === "body-text") input.bodyText = value;
    if (key === "headings") input.headings = parseJsonFlag(value, []);
    if (key === "images") input.images = parseJsonFlag(value, []);
    if (key === "links") input.links = parseJsonFlag(value, []);
    if (key === "ctas") input.ctas = parseJsonFlag(value, []);
    if (key === "pageType" || key === "page-type") input.pageType = value as OnPageAuditInput["pageType"];
    if (key === "primaryKeyword" || key === "primary-keyword") input.primaryKeyword = value;
    if (key === "secondaryKeywords" || key === "secondary-keywords") input.secondaryKeywords = parseJsonFlag(value, []);
    if (key === "mode" && ["website", "page", "code", "planning"].includes(value)) input.mode = value as OnPageAuditInput["mode"];
  }
  const withoutFlags = args.replace(flagPattern, "").trim();
  if (!input.url && /^https?:\/\//iu.test(withoutFlags)) input.url = withoutFlags.split(/\s+/u)[0];
  return input;
}

function normalizeInput(input: OnPageAuditInput): OnPageAuditInput {
  const extracted = input.html ? extractFromHtml(input.html) : {};
  return {
    ...input,
    mode: input.mode ?? "planning",
    title: input.title ?? extracted.title,
    metaDescription: input.metaDescription ?? extracted.metaDescription,
    h1: input.h1 ?? extracted.h1,
    headings: input.headings ?? extracted.headings,
    bodyText: input.bodyText ?? extracted.bodyText,
    images: input.images ?? extracted.images,
    links: input.links ?? extracted.links,
    ctas: input.ctas ?? extracted.ctas
  };
}

function extractFromHtml(html: string): Partial<OnPageAuditInput> {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1]?.trim();
  const metaDescription = html.match(/<meta\b(?=[^>]*name\s*=\s*["']description["'])(?=[^>]*content\s*=\s*["']([^"']*)["'])[^>]*>/iu)?.[1]?.trim();
  const headings: OnPageHeading[] = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/giu)].map((match) => ({ level: match[1].toLowerCase() as OnPageHeading["level"], text: stripTags(match[2]).trim() }));
  const images: OnPageImage[] = [...html.matchAll(/<img\b[^>]*>/giu)].map((match) => ({ src: attr(match[0], "src") ?? "", alt: attr(match[0], "alt") }));
  const links: OnPageLink[] = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/giu)].map((match) => ({ href: match[1], text: stripTags(match[2]).trim(), type: classifyLink(match[1]) }));
  const ctas: OnPageCta[] = links.filter((link) => /\b(book|buy|get|start|try|contact|demo|pricing|quote|signup|sign up)\b/iu.test(link.text ?? "")).map((link) => ({ text: link.text ?? "", href: link.href, position: "unknown" }));
  const bodyText = stripTags(html.replace(/<script[\s\S]*?<\/script>/giu, " ").replace(/<style[\s\S]*?<\/style>/giu, " ")).replace(/\s+/gu, " ").trim();
  return { title, metaDescription, h1: headings.find((heading) => heading.level === "h1")?.text, headings, images, links, ctas, bodyText };
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "iu"))?.[1];
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/gu, " ");
}

function classifyLink(href: string): OnPageLink["type"] {
  if (href.startsWith("/") || href.startsWith("#")) return "internal";
  if (/^https?:\/\//iu.test(href)) return "external";
  return "unknown";
}

function parseJsonFlag<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function hasAnyAuditInput(input: OnPageAuditInput): boolean {
  return Boolean(input.url || input.html || input.title || input.metaDescription || input.h1 || input.headings?.length || input.bodyText || input.images?.length || input.links?.length || input.ctas?.length || input.primaryKeyword);
}

function getMissingInputs(input: OnPageAuditInput): string[] {
  const missing: string[] = [];
  if (!input.html) missing.push("html");
  if (!input.title) missing.push("title");
  if (!input.metaDescription) missing.push("metaDescription");
  if (!input.h1 && !input.headings?.some((heading) => heading.level === "h1")) missing.push("h1");
  if (!input.bodyText) missing.push("bodyText");
  if (!input.images?.length) missing.push("images");
  if (!input.links?.length) missing.push("links");
  if (!input.ctas?.length) missing.push("ctas");
  return missing;
}

function calculateScore(issues: OnPageAuditIssue[]): number {
  const penalties = { P0: 30, P1: 15, P2: 7, P3: 3 };
  return Math.max(0, 100 - issues.reduce((sum, issue) => sum + penalties[issue.priority], 0));
}
