import { runEcommerceAudit } from "./ecommerce-audit.js";
export function runProductSeoAudit(input) {
    return runEcommerceAudit({ ...input, mode: "product" });
}
//# sourceMappingURL=product-seo.js.map