import { runFrameworkSEOAudit } from "./framework-seo-audit.js";
export function runBuildSEOCheck(input) {
    return runFrameworkSEOAudit({ ...input, mode: "build" });
}
//# sourceMappingURL=build-seo-check.js.map