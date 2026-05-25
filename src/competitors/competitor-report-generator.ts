import type { CompetitorAnalysisOutput } from "../types/competitors.ts";

export function generateCompetitorReport(report: CompetitorAnalysisOutput): string {
  return report.summary;
}
