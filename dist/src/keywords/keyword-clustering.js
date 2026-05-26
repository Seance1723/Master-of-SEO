import { mapDifficultyLevel } from "./keyword-difficulty.js";
import { mapFunnelStage } from "./funnel-stage.js";
import { detectKeywordIntent } from "./search-intent.js";
import { recommendPageType, scoreBusinessValue } from "./opportunity-prioritizer.js";
export function normalizeKeywords(keywords) {
    const seen = new Set();
    return keywords.map((keyword) => keyword.trim()).filter(Boolean).map((display) => ({ display, normalized: display.toLowerCase().replace(/\s+/gu, " "), source: "seed" })).filter((item) => {
        if (seen.has(item.normalized))
            return false;
        seen.add(item.normalized);
        return true;
    });
}
export function clusterKeywords(keywords, metrics, business) {
    const buckets = new Map();
    for (const keyword of keywords) {
        const intent = detectKeywordIntent(keyword.display, business);
        const root = rootKey(keyword.normalized, intent);
        const key = `${intent}:${root}`;
        buckets.set(key, [...(buckets.get(key) ?? []), keyword]);
    }
    return [...buckets.entries()].map(([key, items], index) => {
        const intent = key.split(":")[0];
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
function rootKey(keyword, intent) {
    if (["comparison", "pricing", "local"].includes(intent))
        return keyword;
    return keyword.split(/\s+/u).filter((word) => !/^(best|top|how|what|why|guide|for|the|a|an|to|in|near|me)$/iu.test(word)).slice(0, 3).join(" ") || keyword;
}
function pickPrimary(items, metrics) {
    const byVolume = [...items].sort((a, b) => (metrics.find((m) => m.keyword.toLowerCase() === b.normalized)?.volume ?? -1) - (metrics.find((m) => m.keyword.toLowerCase() === a.normalized)?.volume ?? -1));
    if ((metrics.find((m) => m.keyword.toLowerCase() === byVolume[0]?.normalized)?.volume ?? -1) >= 0)
        return byVolume[0].display;
    return [...items].sort((a, b) => a.display.length - b.display.length)[0]?.display ?? items[0].display;
}
function titleCase(value) {
    return value.replace(/\b\w/gu, (char) => char.toUpperCase());
}
//# sourceMappingURL=keyword-clustering.js.map