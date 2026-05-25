import type { CMSFrameworkAuditInput, CMSFrameworkAuditOutput } from "../types/cms-framework.ts";
import { runFrameworkSEOAudit } from "./framework-seo-audit.ts";

export function runReactSEOAudit(input: CMSFrameworkAuditInput): CMSFrameworkAuditOutput {
  return runFrameworkSEOAudit({ ...input, framework: input.framework ?? "react", mode: "react" });
}
