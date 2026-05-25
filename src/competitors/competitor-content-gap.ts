import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from "../types/competitors.ts";
import { runCompetitorAnalysis } from "./competitor-analysis.ts";

export function runCompetitorContentGap(input: CompetitorAnalysisInput): CompetitorAnalysisOutput {
  return runCompetitorAnalysis({ ...input, mode: "content_gap" });
}
