import type { SEOStrategyInput, SEOStrategyOutput } from "../types/strategy.ts";
import { runSEOStrategy } from "./seo-strategy.ts";

export function runMigrationPlan(input: SEOStrategyInput): SEOStrategyOutput {
  if (!input.migration) return runSEOStrategy({ migration: undefined, mode: "migration" });
  return runSEOStrategy({ ...input, mode: "migration" });
}
