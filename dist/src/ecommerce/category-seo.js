import { runEcommerceAudit } from "./ecommerce-audit.js";
export function runCategorySeoAudit(input) {
    return runEcommerceAudit({ ...input, mode: "category" });
}
//# sourceMappingURL=category-seo.js.map