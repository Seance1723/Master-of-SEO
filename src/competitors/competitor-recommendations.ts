import type { CompetitorAnalysisOutput } from "../types/competitors.ts";

export function getCompetitorRecommendations(report: CompetitorAnalysisOutput): unknown[] {
  return report.opportunities;
}
