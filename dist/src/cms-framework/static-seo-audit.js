import { runFrameworkSEOAudit } from "./framework-seo-audit.js";
export function runStaticSEOAudit(input) {
    return runFrameworkSEOAudit({ ...input, framework: input.framework ?? "static", mode: "static" });
}
//# sourceMappingURL=static-seo-audit.js.map