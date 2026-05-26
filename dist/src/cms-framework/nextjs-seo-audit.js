import { runFrameworkSEOAudit } from "./framework-seo-audit.js";
export function runNextJSSEOAudit(input) {
    return runFrameworkSEOAudit({ ...input, framework: input.framework ?? "nextjs", mode: "nextjs" });
}
//# sourceMappingURL=nextjs-seo-audit.js.map