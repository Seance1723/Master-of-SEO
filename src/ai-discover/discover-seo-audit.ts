import type { DiscoverSEOAuditInput, AISearchDiscoverIssue, AISearchDiscoverOutput } from "../types/ai-discover.ts";
import { issue, parseJsonFlag, score } from "./ai-search-audit.ts";

export function runDiscoverSEOAudit(input: DiscoverSEOAuditInput): AISearchDiscoverOutput {
  const normalized = mergeHtmlDiscoverInput({ ...input, mode: input.mode ?? "audit" });
  if (!hasInput(normalized)) return needsDiscoverInput();
  const issues = [
    ...checkDiscoverReadiness(normalized),
    ...checkTitleThumbnail(normalized),
    ...checkNewsPublisher(normalized)
  ];
  const missingInputs = missingDiscoverInputs(normalized);
  const status = missingInputs.length ? "partial" : "completed";
  return {
    skill: "ai-search-discover-seo",
    status,
    score: score(issues),
    summary: `${status === "partial" ? "Partial Discover SEO audit completed" : "Discover SEO audit completed"}. Reviewed ${normalized.images?.length ?? 0} image(s), publisher signals, and found ${issues.length} issue(s).`,
    aiSearchFindings: [],
    answerBlockFindings: [],
    entityFindings: [],
    contentQualityFindings: [],
    discoverFindings: [`Images reviewed: ${normalized.images?.length ?? 0}`, `Max image preview: ${normalized.page?.maxImagePreview ?? "not provided"}`],
    newsPublisherFindings: [`Publisher: ${normalized.publisher?.name ?? "not provided"}`],
    issues,
    missingInputs,
    nextActions: issues.length ? ["Fix P1/P2 indexability, image preview, publisher, and title/thumbnail risks first.", "Provide publisher, image, OG, and article date inputs for deeper checks."] : ["Keep Discover content useful, honest, visual, and publisher-transparent."]
  };
}

export function parseDiscoverInputFromText(rawInput: string): DiscoverSEOAuditInput {
  const input: DiscoverSEOAuditInput = { mode: "discover" };
  const args = rawInput.replace(/^\/seo-master\s+discover-seo-audit\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "url") input.url = value;
    if (key === "html") input.html = value;
    if (key === "page") input.page = parseJsonFlag(value, undefined);
    if (key === "publisher") input.publisher = parseJsonFlag(value, undefined);
    if (key === "images") input.images = parseJsonFlag(value, []);
    if (key === "openGraph" || key === "open-graph") input.openGraph = parseJsonFlag(value, undefined);
    if (key === "contentSignals" || key === "content-signals") input.contentSignals = parseJsonFlag(value, undefined);
  }
  return input;
}

function mergeHtmlDiscoverInput(input: DiscoverSEOAuditInput): DiscoverSEOAuditInput {
  if (!input.html) return input;
  const title = textMatch(input.html, /<title[^>]*>([\s\S]*?)<\/title>/iu);
  const ogImage = metaContent(input.html, "property", "og:image");
  const ogTitle = metaContent(input.html, "property", "og:title");
  const ogDescription = metaContent(input.html, "property", "og:description");
  const ogImageAlt = metaContent(input.html, "property", "og:image:alt");
  const robots = metaContent(input.html, "name", "robots");
  const maxImagePreview = robots?.match(/max-image-preview:([^,\s]+)/iu)?.[1] as NonNullable<DiscoverSEOAuditInput["page"]>["maxImagePreview"] | undefined;
  return {
    ...input,
    page: {
      ...input.page,
      title: input.page?.title ?? title,
      maxImagePreview: input.page?.maxImagePreview ?? maxImagePreview,
      allowsSnippets: input.page?.allowsSnippets ?? (robots ? !robots.toLowerCase().includes("nosnippet") : undefined),
      isIndexable: input.page?.isIndexable ?? (robots ? !robots.toLowerCase().includes("noindex") : undefined)
    },
    openGraph: input.openGraph ?? { ogTitle, ogDescription, ogImage, ogImageAlt }
  };
}

function checkDiscoverReadiness(input: DiscoverSEOAuditInput): AISearchDiscoverIssue[] {
  const issues: AISearchDiscoverIssue[] = [];
  if (input.page?.isIndexable === false) issues.push(issue("discover-page-not-indexable", "discover-readiness", "P1", "Discover page is not indexable", "Keep Discover-targeted pages indexable.", [input.page.url ?? "page"], ["discover", "audit"]));
  if (input.page?.allowsSnippets === false) issues.push(issue("discover-nosnippet", "discover-readiness", "P2", "Snippets are blocked for Discover-targeted content", "Allow snippets unless there is a sensitive-content reason.", [input.page.url ?? "page"], ["discover", "audit"]));
  if (input.page?.maxImagePreview !== undefined && input.page.maxImagePreview !== "large") issues.push(issue("discover-max-image-preview-not-large", "large-image-preview", "P3", "max-image-preview is not large", "Use max-image-preview:large where visual discovery matters.", [input.page.maxImagePreview], ["discover", "audit"]));
  if (!input.openGraph?.ogImage && !input.images?.some((image) => ["hero", "thumbnail"].includes(image.position ?? ""))) issues.push(issue("discover-missing-og-hero-image", "large-image-preview", "P2", "Discover article is missing OG, hero, or thumbnail image input", "Provide a relevant high-quality image.", [input.page?.title ?? "page"], ["discover", "audit"]));
  for (const image of input.images ?? []) if ((image.width !== undefined && image.width < 1200) || (image.height !== undefined && image.height < 675)) issues.push(issue("discover-image-too-small", "large-image-preview", "P3", "Provided image may be too small for large previews", "Use high-quality large images.", [image.src], ["discover", "audit"]));
  if (input.contentSignals?.hasClickbaitRisk) issues.push(issue("discover-clickbait-risk", "discover-title-thumbnail", "P2", "Clickbait risk flag provided", "Use strong but honest titles.", [input.page?.title ?? "title"], ["discover", "content", "audit"]));
  if (input.contentSignals?.hasMisleadingTitleRisk) issues.push(issue("discover-misleading-title-risk", "discover-title-thumbnail", "P2", "Misleading title risk flag provided", "Align title with actual content.", [input.page?.title ?? "title"], ["discover", "content", "audit"]));
  if (input.contentSignals?.hasShockingThumbnailRisk) issues.push(issue("discover-shocking-thumbnail-risk", "discover-title-thumbnail", "P2", "Shocking thumbnail risk flag provided", "Avoid misleading or exaggerated thumbnails.", [input.openGraph?.ogImage ?? "thumbnail"], ["discover", "audit"]));
  if (["article", "news"].includes(input.page?.pageType ?? "") && input.contentSignals?.hasOriginalReporting === false && input.contentSignals?.hasExpertAuthor === false) issues.push(issue("discover-no-original-reporting-expert-signal", "discover-readiness", "P3", "Article/news input lacks original reporting or expert signal", "Add original reporting, expertise, or proof where relevant.", [input.page?.title ?? "article"], ["discover", "content", "audit"]));
  return issues;
}

function checkTitleThumbnail(input: DiscoverSEOAuditInput): AISearchDiscoverIssue[] {
  const issues: AISearchDiscoverIssue[] = [];
  const title = input.page?.headline ?? input.page?.title ?? input.openGraph?.ogTitle ?? "";
  if (/^(update|news|guide|tips|things)$/iu.test(title.trim()) || title.trim().length < 12) issues.push(issue("discover-title-too-vague", "discover-title-thumbnail", "P3", "Discover title is too vague", "Use a specific honest title.", [title || "missing title"], ["discover", "content", "audit"]));
  if ((input.openGraph?.ogImage || input.images?.length) && !input.openGraph?.ogImageAlt && !(input.images ?? []).some((image) => image.alt)) issues.push(issue("discover-thumbnail-missing-alt", "discover-title-thumbnail", "P3", "Thumbnail/OG image missing alt text", "Provide relevant image alt text when available.", [input.openGraph?.ogImage ?? "image"], ["discover", "audit"]));
  if (!input.openGraph?.ogImage) issues.push(issue("discover-og-image-missing", "discover-title-thumbnail", "P3", "OG image missing", "Add a clear Open Graph image for shareable content.", [input.page?.url ?? "page"], ["discover", "audit"]));
  return issues;
}

function checkNewsPublisher(input: DiscoverSEOAuditInput): AISearchDiscoverIssue[] {
  const issues: AISearchDiscoverIssue[] = [];
  const article = ["article", "news", "blog"].includes(input.page?.pageType ?? "");
  if (article && !input.publisher?.name) issues.push(issue("discover-missing-publisher-name", "news-publisher", "P2", "Article/news page missing publisher name", "Show publisher identity clearly.", [input.page?.title ?? "article"], ["discover", "audit"]));
  if (article && !input.publisher?.author) issues.push(issue("discover-missing-author", "news-publisher", "P3", "Article/news page missing author", "Show real author information where relevant.", [input.page?.title ?? "article"], ["discover", "audit"]));
  if (article && !input.page?.publishDate) issues.push(issue("discover-missing-publish-date", "news-publisher", "P3", "Article/news page missing publish date", "Show accurate publish date.", [input.page?.title ?? "article"], ["discover", "audit"]));
  if (input.publisher && !input.publisher.logo) issues.push(issue("discover-publisher-logo-missing", "news-publisher", "P3", "Publisher logo missing", "Provide publisher logo where relevant.", [input.publisher.name ?? "publisher"], ["discover", "audit"]));
  if (input.page?.publishDate && input.page.modifiedDate && Date.parse(input.page.modifiedDate) < Date.parse(input.page.publishDate)) issues.push(issue("discover-modified-before-published", "news-publisher", "P2", "Modified date is older than publish date", "Keep publish and modified dates accurate.", [input.page.publishDate, input.page.modifiedDate], ["discover", "audit"]));
  if (article && !input.html?.includes("Article") && !input.html?.includes("NewsArticle")) issues.push(issue("discover-article-schema-missing", "news-publisher", "P2", "Article/NewsArticle schema not detected in provided HTML", "Add accurate Article or NewsArticle schema where relevant.", [input.page?.url ?? "article"], ["discover", "audit"]));
  return issues;
}

function hasInput(input: DiscoverSEOAuditInput): boolean {
  return Boolean(input.html || input.page || input.publisher || input.images?.length || input.openGraph || input.contentSignals);
}

function missingDiscoverInputs(input: DiscoverSEOAuditInput): string[] {
  const missing: string[] = [];
  if (!input.page && !input.html) missing.push("page or html");
  if (!input.publisher) missing.push("publisher");
  if (!input.images?.length) missing.push("images");
  if (!input.openGraph) missing.push("openGraph");
  if (!input.contentSignals) missing.push("contentSignals");
  return missing;
}

function needsDiscoverInput(): AISearchDiscoverOutput {
  return { skill: "ai-search-discover-seo", status: "needs_input", score: 0, summary: "Needs input. Provide Discover page, publisher, image, Open Graph, content signal, or HTML data.", aiSearchFindings: [], answerBlockFindings: [], entityFindings: [], contentQualityFindings: [], discoverFindings: [], newsPublisherFindings: [], issues: [], missingInputs: ["html", "page", "publisher", "images", "openGraph", "contentSignals"], nextActions: ["Provide explicit Discover SEO inputs.", "No live Discover, news, or ranking checks were performed."] };
}

function textMatch(html: string, pattern: RegExp): string | undefined {
  const match = pattern.exec(html);
  return match?.[1] ? stripTags(match[1]).trim() : undefined;
}

function metaContent(html: string, attr: "name" | "property", value: string): string | undefined {
  return new RegExp(`<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']+)["'][^>]*>`, "iu").exec(html)?.[1];
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}
