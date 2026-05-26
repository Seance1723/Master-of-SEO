import { runFrameworkSEOAudit } from "./framework-seo-audit.js";
export function runReactSEOAudit(input) {
    return runFrameworkSEOAudit({ ...input, framework: input.framework ?? "react", mode: "react" });
}
//# sourceMappingURL=react-seo-audit.js.map