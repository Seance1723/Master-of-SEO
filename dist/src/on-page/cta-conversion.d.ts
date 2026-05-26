import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";
export declare const ctaConversionRules: OnPageRule[];
export declare function checkCtaConversion(input: OnPageAuditInput): {
    issues: OnPageAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=cta-conversion.d.ts.map