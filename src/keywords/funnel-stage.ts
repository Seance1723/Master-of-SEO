import type { FunnelStage, KeywordIntent } from "../types/keywords.ts";

export function mapFunnelStage(intent: KeywordIntent): FunnelStage {
  if (intent === "informational") return "tofu";
  if (intent === "commercial" || intent === "comparison" || intent === "product_led") return "mofu";
  if (intent === "transactional" || intent === "pricing" || intent === "local") return "bofu";
  if (intent === "support" || intent === "navigational") return "retention";
  return "unknown";
}
