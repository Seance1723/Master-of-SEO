import type { ContentItem, ContentKeywordCluster } from "../types/content.ts";
import type { KeywordPageType } from "../types/keywords.ts";

export function pageTypeForCluster(cluster: ContentKeywordCluster): KeywordPageType {
  if (cluster.intent === "product_led") return "product";
  if (cluster.intent === "commercial") return cluster.recommendedPageType === "comparison" ? "comparison" : "landing";
  if (cluster.intent === "transactional") return cluster.recommendedPageType === "product" ? "product" : "service";
  if (cluster.intent === "informational") return "blog";
  if (cluster.intent === "local") return "local";
  if (cluster.intent === "pricing") return "pricing";
  if (cluster.intent === "support") return "documentation";
  return cluster.recommendedPageType ?? "unknown";
}

export function makeContentItem(cluster: ContentKeywordCluster, kind: "pillar" | "supporting", index: number, pageType: KeywordPageType, priority: ContentItem["priority"]): ContentItem {
  const title = `${titleCase(cluster.primaryKeyword)}${kind === "pillar" ? "" : " Guide"}`;
  return {
    contentId: `${kind}-${index}`,
    title,
    targetKeyword: cluster.primaryKeyword,
    secondaryKeywords: cluster.secondaryKeywords ?? [],
    intent: cluster.intent ?? "unknown",
    funnelStage: cluster.funnelStage ?? "unknown",
    recommendedPageType: pageType,
    suggestedUrl: `/${slug(cluster.primaryKeyword)}`,
    h1: title,
    h2Outline: ["Overview", "Key considerations", "Examples", "Next steps"],
    mustCoverSections: ["User intent", "Business relevance", "Examples or proof", "Internal links"],
    faqs: [`What is ${cluster.primaryKeyword}?`, `How should teams use ${cluster.primaryKeyword}?`],
    internalLinksToAdd: kind === "pillar" ? ["Pillar page -> supporting pages", "Supporting pages -> pillar page"] : ["Supporting page -> pillar page", "Supporting page -> related commercial page"],
    ctaRecommendation: ["commercial", "transactional", "pricing", "product_led", "local"].includes(cluster.intent ?? "") ? "Use a clear commercial CTA." : "Use a soft CTA to related commercial content.",
    schemaRecommendation: pageType === "blog" ? "Article" : pageType === "local" ? "LocalBusiness" : "WebPage",
    qualityNotes: ["Add original examples, proof, screenshots, data, or expert input.", "Avoid generic AI-style filler."],
    successMetric: ["bofu", "mofu"].includes(cluster.funnelStage ?? "") ? "Leads or assisted conversions" : "Qualified organic sessions and internal link clicks",
    priority
  };
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

function titleCase(value: string): string {
  return value.replace(/\b\w/gu, (char) => char.toUpperCase());
}
