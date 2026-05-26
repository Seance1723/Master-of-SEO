import type { SEOStrategyInput, SEOStrategyOutput } from "../types/strategy.ts";
import { runSEOStrategy } from "./seo-strategy.ts";

export function runLaunchChecklist(input: SEOStrategyInput): SEOStrategyOutput {
  if (!input.launch) return runSEOStrategy({ launch: undefined, mode: "launch" });
  return runSEOStrategy({ ...input, mode: "launch" });
}
