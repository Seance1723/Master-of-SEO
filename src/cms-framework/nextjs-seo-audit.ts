import type { CMSFrameworkAuditInput, CMSFrameworkAuditOutput } from "../types/cms-framework.ts";
import { runFrameworkSEOAudit } from "./framework-seo-audit.ts";

export function runNextJSSEOAudit(input: CMSFrameworkAuditInput): CMSFrameworkAuditOutput {
  return runFrameworkSEOAudit({ ...input, framework: input.framework ?? "nextjs", mode: "nextjs" });
}
