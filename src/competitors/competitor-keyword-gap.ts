import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from "../types/competitors.ts";
import { runCompetitorAnalysis } from "./competitor-analysis.ts";

export function runCompetitorKeywordGap(input: CompetitorAnalysisInput): CompetitorAnalysisOutput {
  return runCompetitorAnalysis({ ...input, mode: "keyword_gap" });
}
