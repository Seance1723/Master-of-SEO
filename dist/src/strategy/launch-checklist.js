import { runSEOStrategy } from "./seo-strategy.js";
export function runLaunchChecklist(input) {
    if (!input.launch)
        return runSEOStrategy({ launch: undefined, mode: "launch" });
    return runSEOStrategy({ ...input, mode: "launch" });
}
//# sourceMappingURL=launch-checklist.js.map