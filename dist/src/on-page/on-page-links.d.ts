import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";
export declare const onPageLinkRules: OnPageRule[];
export declare function checkOnPageLinks(input: OnPageAuditInput): {
    issues: OnPageAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=on-page-links.d.ts.map