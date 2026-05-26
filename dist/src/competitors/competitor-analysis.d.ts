import type { CompetitorAnalysisInput, CompetitorAnalysisOutput, CompetitorType } from "../types/competitors.ts";
export declare function runCompetitorAnalysis(input: CompetitorAnalysisInput): CompetitorAnalysisOutput;
export declare function parseCompetitorAnalysisInputFromText(rawInput: string): CompetitorAnalysisInput;
export declare function detectCompetitorTypes(input: CompetitorAnalysisInput): Array<{
    competitor: string;
    type: CompetitorType;
    evidence: string[];
}>;
//# sourceMappingURL=competitor-analysis.d.ts.map