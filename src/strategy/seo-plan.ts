import type { SEOStrategyInput, SEOStrategyOutput } from "../types/strategy.ts";
import { runSEOStrategy } from "./seo-strategy.ts";

export function runSEOPlan(input: SEOStrategyInput): SEOStrategyOutput {
  return runSEOStrategy({ ...input, mode: "seo_plan" });
}
