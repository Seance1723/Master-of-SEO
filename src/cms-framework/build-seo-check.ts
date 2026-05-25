import type { CMSFrameworkAuditInput, CMSFrameworkAuditOutput } from "../types/cms-framework.ts";
import { runFrameworkSEOAudit } from "./framework-seo-audit.ts";

export function runBuildSEOCheck(input: CMSFrameworkAuditInput): CMSFrameworkAuditOutput {
  return runFrameworkSEOAudit({ ...input, mode: "build" });
}
