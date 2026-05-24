import type { DetectionResult } from "../types/index.ts";

export type PageType = "Homepage" | "Service page" | "Product page" | "Category page" | "Blog post" | "Landing page" | "Pricing page" | "Contact page" | "About page" | "Documentation page" | "Unknown";

const signals: Record<Exclude<PageType, "Unknown">, string[]> = {
  "Homepage": ["homepage", "home page", "root page"],
  "Service page": ["service", "services", "solutions"],
  "Product page": ["product", "sku", "buy now"],
  "Category page": ["category", "collection", "listing"],
  "Blog post": ["blog", "article", "post"],
  "Landing page": ["landing", "campaign", "lead"],
  "Pricing page": ["pricing", "plans", "subscription"],
  "Contact page": ["contact", "phone", "email"],
  "About page": ["about", "team", "mission"],
  "Documentation page": ["docs", "documentation", "api", "reference"]
};

export function detectPageType(input: string): DetectionResult<PageType> {
  const haystack = input.toLowerCase();
  let best: DetectionResult<PageType> = { type: "Unknown", confidence: 0, matchedSignals: [] };
  for (const [type, keywords] of Object.entries(signals)) {
    const matchedSignals = keywords.filter((keyword) => haystack.includes(keyword));
    if (matchedSignals.length > best.matchedSignals.length) {
      best = { type: type as PageType, confidence: Math.min(0.95, 0.45 + matchedSignals.length * 0.15), matchedSignals };
    }
  }
  return best;
}
