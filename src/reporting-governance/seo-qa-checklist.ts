import type { ReportingGovernanceInput, ReportingGovernanceOutput } from "../types/reporting-governance.ts";
import { runSEOMeasurement } from "./seo-measurement.ts";

export function runSEOQAChecklist(input: ReportingGovernanceInput = {}): ReportingGovernanceOutput {
  return runSEOMeasurement({ ...input, mode: "qa" });
}
