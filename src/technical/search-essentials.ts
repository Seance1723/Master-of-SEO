import type { TechnicalRule } from "../types/technical.ts";

export const searchEssentialsRules: TechnicalRule[] = [
  {
    id: "search-essentials-core",
    category: "search-essentials",
    title: "Google Search Essentials baseline",
    description: "Important pages should be crawlable, indexable, and helpful.",
    do: ["Make pages crawlable", "Make valuable pages indexable", "Create helpful content"],
    dont: ["Use cloaking", "Use hidden text", "Use keyword stuffing", "Create doorway pages", "Publish mass low-value AI content", "Use scraped content"],
    priority: "P0",
    appliesTo: ["website", "page", "technical", "audit"],
    status: "active"
  }
];
