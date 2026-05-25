import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from "../types/competitors.ts";
import { runCompetitorAnalysis } from "./competitor-analysis.ts";

export function runCompetitorBacklinkGap(input: CompetitorAnalysisInput): CompetitorAnalysisOutput {
  return runCompetitorAnalysis({ ...input, mode: "backlink_gap" });
}
