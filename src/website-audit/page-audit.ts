import type { WebsiteAuditInput, WebsiteAuditOutput } from "../types/website-audit.ts";
import { runWebsiteAudit } from "./website-audit.ts";

export function runPageAudit(input: WebsiteAuditInput): WebsiteAuditOutput {
  return runWebsiteAudit({ ...input, mode: "page" });
}
