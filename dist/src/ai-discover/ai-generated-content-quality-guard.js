import { runAISearchAudit } from "./ai-search-audit.js";
export function runAIContentQualityAudit(input) {
    return runAISearchAudit({ ...input, mode: "content_quality" });
}
//# sourceMappingURL=ai-generated-content-quality-guard.js.map