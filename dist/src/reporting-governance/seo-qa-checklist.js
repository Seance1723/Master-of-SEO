import { runSEOMeasurement } from "./seo-measurement.js";
export function runSEOQAChecklist(input = {}) {
    return runSEOMeasurement({ ...input, mode: "qa" });
}
//# sourceMappingURL=seo-qa-checklist.js.map