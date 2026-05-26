import { runWebsiteAudit } from "./website-audit.js";
export function runPageAudit(input) {
    return runWebsiteAudit({ ...input, mode: "page" });
}
//# sourceMappingURL=page-audit.js.map