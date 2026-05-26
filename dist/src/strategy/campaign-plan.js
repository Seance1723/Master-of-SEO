import { runSEOStrategy } from "./seo-strategy.js";
export function runCampaignPlan(input) {
    return runSEOStrategy({ ...input, mode: "campaign" });
}
//# sourceMappingURL=campaign-plan.js.map