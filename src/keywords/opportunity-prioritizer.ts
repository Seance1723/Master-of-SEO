import type { KeywordBusinessContext, KeywordCluster, KeywordIntent, KeywordMetric, KeywordOpportunity, KeywordPageType } from "../types/keywords.ts";

export function recommendPageType(intent: KeywordIntent, business?: KeywordBusinessContext): KeywordPageType {
  if (intent === "informational") return "blog";
  if (intent === "commercial" || intent === "comparison") return "comparison";
  if (intent === "transactional") return business?.websiteType === "ecommerce" ? "product" : "service";
  if (intent === "pricing") return "pricing";
  if (intent === "local") return "local";
  if (intent === "support") return "documentation";
  if (intent === "navigational") return "homepage";
  if (intent === "product_led") return "product";
  return "unknown";
}

export function scoreBusinessValue(keyword: string, intent: KeywordIntent, business?: KeywordBusinessContext): "high" | "medium" | "low" | "unknown" {
  const text = keyword.toLowerCase();
  const businessTerms = [...(business?.services ?? []), ...(business?.products ?? [])].map((term) => term.toLowerCase());
  const matchesBusiness = businessTerms.some((term) => text.includes(term) || term.includes(text));
  if (["transactional", "pricing", "local", "product_led"].includes(intent)) return "high";
  if (intent === "commercial" && matchesBusiness) return "high";
  if (["comparison", "support"].includes(intent) || (intent === "informational" && matchesBusiness)) return "medium";
  if (intent === "informational") return "low";
  return "unknown";
}

export function findOpportunities(clusters: KeywordCluster[], metrics: KeywordMetric[], competitorKeywords: string[]): KeywordOpportunity[] {
  const opportunities: KeywordOpportunity[] = [];
  for (const cluster of clusters) {
    const metric = metrics.find((item) => item.keyword.toLowerCase() === cluster.primaryKeyword.toLowerCase());
    if (metric?.currentRank !== undefined && metric.currentRank >= 4 && metric.currentRank <= 20 && ["high", "medium"].includes(cluster.businessValue)) {
      opportunities.push({ keyword: cluster.primaryKeyword, type: "quick_win", priority: "P1", reason: `Current rank is ${metric.currentRank}.` });
    }
    if (cluster.difficultyLevel === "easy" && cluster.businessValue === "high") {
      opportunities.push({ keyword: cluster.primaryKeyword, type: "quick_win", priority: "P1", reason: "Low provided difficulty with high business value." });
    }
    if (cluster.funnelStage === "bofu" && !cluster.targetUrl) {
      opportunities.push({ keyword: cluster.primaryKeyword, type: "bofu_gap", priority: "P1", reason: "BOFU keyword has no mapped page." });
    }
    if (competitorKeywords.map((item) => item.toLowerCase()).includes(cluster.primaryKeyword.toLowerCase()) && !cluster.targetUrl) {
      opportunities.push({ keyword: cluster.primaryKeyword, type: "competitor_gap", priority: "P2", reason: "Competitor keyword has no mapped page." });
    }
  }
  return opportunities;
}
