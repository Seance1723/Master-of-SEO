import type { AISearchAuditInput, AISearchDiscoverOutput } from "../types/ai-discover.ts";
import { runAISearchAudit } from "./ai-search-audit.ts";

export function runAIContentQualityAudit(input: AISearchAuditInput): AISearchDiscoverOutput {
  return runAISearchAudit({ ...input, mode: "content_quality" });
}
