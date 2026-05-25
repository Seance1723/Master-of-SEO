import type { TrustAuditInput, TSAOutput } from "../types/trust-security-accessibility.ts";
import { runTrustAudit } from "./trust-audit.ts";

export function runEEATAudit(input: TrustAuditInput): TSAOutput {
  return runTrustAudit({ ...input, mode: "eeat" });
}
