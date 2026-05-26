import type { ReportingGovernanceOutput } from "../types/reporting-governance.ts";
export function getReportingGovernanceRecommendations(report: ReportingGovernanceOutput): string[] { return report.nextActions; }
