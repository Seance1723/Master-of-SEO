import type { WebsiteAuditOutput } from "../types/website-audit.ts";

export function getWebsiteAuditRecommendations(report: WebsiteAuditOutput): string[] {
  return report.nextActions;
}
