import type { EcommerceAuditInput, EcommerceAuditOutput } from "../types/ecommerce.ts";
import { runEcommerceAudit } from "./ecommerce-audit.ts";

export function runProductSeoAudit(input: EcommerceAuditInput): EcommerceAuditOutput {
  return runEcommerceAudit({ ...input, mode: "product" });
}
