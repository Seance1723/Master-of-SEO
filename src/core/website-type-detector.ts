import type { DetectionResult } from "../types/index.ts";

export type WebsiteType = "SaaS" | "Ecommerce" | "Local business" | "Blog/news" | "Corporate" | "Portfolio" | "Marketplace" | "Documentation" | "Landing page" | "Unknown";

const signals: Record<Exclude<WebsiteType, "Unknown">, string[]> = {
  "SaaS": ["saas", "software", "platform", "subscription", "demo", "workspace"],
  "Ecommerce": ["shop", "cart", "checkout", "product", "collection", "store"],
  "Local business": ["near me", "location", "hours", "appointment", "service area", "directions"],
  "Blog/news": ["blog", "news", "article", "editorial", "post"],
  "Corporate": ["company", "investors", "careers", "enterprise", "solutions"],
  "Portfolio": ["portfolio", "case study", "work", "gallery"],
  "Marketplace": ["marketplace", "vendors", "sellers", "buyers", "listings"],
  "Documentation": ["docs", "documentation", "api", "guide", "reference"],
  "Landing page": ["landing", "campaign", "waitlist", "lead magnet"]
};

export function detectWebsiteType(input: string): DetectionResult<WebsiteType> {
  return detect(input, signals, "Unknown");
}

function detect<T extends string>(input: string, map: Record<string, string[]>, fallback: T): DetectionResult<T> {
  const haystack = input.toLowerCase();
  let best = { type: fallback, matchedSignals: [] as string[] };
  for (const [type, keywords] of Object.entries(map)) {
    const matchedSignals = keywords.filter((keyword) => haystack.includes(keyword));
    if (matchedSignals.length > best.matchedSignals.length) best = { type: type as T, matchedSignals };
  }
  return { type: best.type as T, confidence: best.matchedSignals.length ? Math.min(0.95, 0.45 + best.matchedSignals.length * 0.15) : 0, matchedSignals: best.matchedSignals };
}
