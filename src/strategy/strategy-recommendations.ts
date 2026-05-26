import type { SEOStrategyOutput } from "../types/strategy.ts";

export function getStrategyRecommendations(report: SEOStrategyOutput): unknown[] {
  return report.priorityOpportunities;
}
