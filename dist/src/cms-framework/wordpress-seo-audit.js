import { runFrameworkSEOAudit } from "./framework-seo-audit.js";
export function runWordPressSEOAudit(input) {
    return runFrameworkSEOAudit({ ...input, framework: input.framework ?? "wordpress", cms: { name: "wordpress", ...input.cms }, mode: "wordpress" });
}
//# sourceMappingURL=wordpress-seo-audit.js.map