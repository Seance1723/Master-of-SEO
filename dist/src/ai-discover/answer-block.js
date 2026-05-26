import { runAISearchAudit } from "./ai-search-audit.js";
export function runAnswerBlockAudit(input) {
    return runAISearchAudit({ ...input, mode: "answer_block" });
}
//# sourceMappingURL=answer-block.js.map