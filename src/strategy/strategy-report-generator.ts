import type { SEOStrategyOutput } from "../types/strategy.ts";

export function generateStrategyReport(report: SEOStrategyOutput): string {
  return report.summary;
}
