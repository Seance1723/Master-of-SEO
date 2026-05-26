import type { CMSFrameworkAuditInput, CMSFrameworkAuditOutput, CMSFrameworkIssue, FrameworkName } from "../types/cms-framework.ts";
export declare function runFrameworkSEOAudit(input: CMSFrameworkAuditInput): CMSFrameworkAuditOutput;
export declare function parseCMSFrameworkInputFromText(rawInput: string): CMSFrameworkAuditInput;
export declare function detectFramework(input: CMSFrameworkAuditInput): FrameworkName;
export declare function needsInput(): CMSFrameworkAuditOutput;
export declare function issue(id: string, category: string, priority: CMSFrameworkIssue["priority"], title: string, howToFix: string, evidence: string[], appliesTo: CMSFrameworkIssue["appliesTo"]): CMSFrameworkIssue;
export declare function score(issues: CMSFrameworkIssue[]): number;
export declare function parseJsonFlag<T>(value: string, fallback: T): T;
//# sourceMappingURL=framework-seo-audit.d.ts.map