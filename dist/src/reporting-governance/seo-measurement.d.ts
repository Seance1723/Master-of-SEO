import type { ReportingGovernanceInput, ReportingGovernanceOutput } from "../types/reporting-governance.ts";
export declare function runSEOMeasurement(input: ReportingGovernanceInput): ReportingGovernanceOutput;
export declare function parseReportingGovernanceInputFromText(rawInput: string): ReportingGovernanceInput;
export declare function mapKpis(input: ReportingGovernanceInput): unknown[];
export declare function buildQaChecklist(): unknown[];
export declare function releaseRisks(input: ReportingGovernanceInput): unknown[];
//# sourceMappingURL=seo-measurement.d.ts.map