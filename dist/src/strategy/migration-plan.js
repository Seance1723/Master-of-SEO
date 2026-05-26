import { runSEOStrategy } from "./seo-strategy.js";
export function runMigrationPlan(input) {
    if (!input.migration)
        return runSEOStrategy({ migration: undefined, mode: "migration" });
    return runSEOStrategy({ ...input, mode: "migration" });
}
//# sourceMappingURL=migration-plan.js.map