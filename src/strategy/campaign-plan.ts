import type { SEOStrategyInput, SEOStrategyOutput } from "../types/strategy.ts";
import { runSEOStrategy } from "./seo-strategy.ts";

export function runCampaignPlan(input: SEOStrategyInput): SEOStrategyOutput {
  return runSEOStrategy({ ...input, mode: "campaign" });
}
