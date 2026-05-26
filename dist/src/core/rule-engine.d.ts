import type { SeoRule } from "../types/index.ts";
export declare const coreRules: SeoRule[];
export declare function getRules(status?: SeoRule["status"]): SeoRule[];
export declare function getRulesByAppliesTo(area: SeoRule["appliesTo"][number]): SeoRule[];
//# sourceMappingURL=rule-engine.d.ts.map