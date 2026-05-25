import type { AISearchAuditInput, AISearchDiscoverOutput } from "../types/ai-discover.ts";
import { runAISearchAudit } from "./ai-search-audit.ts";

export function runAnswerBlockAudit(input: AISearchAuditInput): AISearchDiscoverOutput {
  return runAISearchAudit({ ...input, mode: "answer_block" });
}
