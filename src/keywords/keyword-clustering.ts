import type { KeywordBusinessContext, KeywordCluster, KeywordMetric } from "../types/keywords.ts";
import { mapDifficultyLevel } from "./keyword-difficulty.ts";
import { mapFunnelStage } from "./funnel-stage.ts";
import { detectKeywordIntent } from "./search-intent.ts";
import { recommendPageType, scoreBusinessValue } from "./opportunity-prioritizer.ts";

export interface NormalizedKeyword {
  display: string;
  normalized: string;
  source: "seed" | "competitor" | "metric";
}

export function normalizeKeywords(keywords: string[]): NormalizedKeyword[] {
  const seen = new Set<string>();
  return keywords.map((keyword) => keyword.trim()).filter(Boolean).map((display) => ({ display, normalized: display.toLowerCase().replace(/\s+/gu, " "), source: "seed" as const })).filter((item) => {
    if (seen.has(item.normalized)) return false;
    seen.add(item.normalized);
    return true;
  });
}

export function clusterKeywords(keywords: NormalizedKeyword[], metrics: KeywordMetric[], business?: KeywordBusinessContext): KeywordCluster[] {
  const buckets = new Map<string, NormalizedKeyword[]>();
  for (const keyword of keywords) {
    const intent = detectKeywordIntent(keyword.display, business);
    const root = rootKey(keyword.normalized, intent);
    const key = `${intent}:${root}`;
    buckets.set(key, [...(buckets.get(key) ?? []), keyword]);
  }
  return [...buckets.entries()].map(([key, items], index) => {
    const intent = key.split(":")[0] as KeywordCluster["intent"];
    const primaryKeyword = pickPrimary(items, metrics);
    const metric = metrics.find((item) => item.keyword.toLowerCase() === primaryKeyword.toLowerCase());
    const businessValue = scoreBusinessValue(primaryKeyword, intent, business);
    return {
      clusterId: `cluster-${index + 1}`,
      clusterName: titleCase(key.split(":").slice(1).join(" ")),
      primaryKeyword,
      secondaryKeywords: items.map((item) => item.display).filter((keyword) => keyword !== primaryKeyword),
      intent,
      funnelStage: mapFunnelStage(intent),
      recommendedPageType: recommendPageType(intent, business),
      priority: businessValue === "high" ? "P1" : businessValue === "medium" ? "P2" : "P3",
      businessValue,
      difficultyLevel: mapDifficultyLevel(metric?.difficulty),
      notes: metric?.difficulty === undefined ? ["Difficulty unknown because no difficulty metric was provided."] : []
    };
  });
}

function rootKey(keyword: string, intent: string): string {
  if (["comparison", "pricing", "local"].includes(intent)) return keyword;
  return keyword.split(/\s+/u).filter((word) => !/^(best|top|how|what|why|guide|for|the|a|an|to|in|near|me)$/iu.test(word)).slice(0, 3).join(" ") || keyword;
}

function pickPrimary(items: NormalizedKeyword[], metrics: KeywordMetric[]): string {
  const byVolume = [...items].sort((a, b) => (metrics.find((m) => m.keyword.toLowerCase() === b.normalized)?.volume ?? -1) - (metrics.find((m) => m.keyword.toLowerCase() === a.normalized)?.volume ?? -1));
  if ((metrics.find((m) => m.keyword.toLowerCase() === byVolume[0]?.normalized)?.volume ?? -1) >= 0) return byVolume[0].display;
  return [...items].sort((a, b) => a.display.length - b.display.length)[0]?.display ?? items[0].display;
}

function titleCase(value: string): string {
  return value.replace(/\b\w/gu, (char) => char.toUpperCase());
}
