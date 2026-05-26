import { runTrustAudit } from "./trust-audit.js";
export function runEEATAudit(input) {
    return runTrustAudit({ ...input, mode: "eeat" });
}
//# sourceMappingURL=eeat-audit.js.map