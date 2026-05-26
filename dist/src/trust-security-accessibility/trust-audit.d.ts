import type { TrustAuditInput, TSAIssue, TSAOutput } from "../types/trust-security-accessibility.ts";
export declare function runTrustAudit(input: TrustAuditInput): TSAOutput;
export declare function parseTrustInputFromText(rawInput: string): TrustAuditInput;
export declare function needsTrustInput(): TSAOutput;
export declare function output(status: TSAOutput["status"], summary: string, issues: TSAIssue[], missingInputs: string[], findings: Partial<Pick<TSAOutput, "trustFindings" | "eeatFindings" | "securityFindings" | "accessibilityFindings" | "policyFindings">>): TSAOutput;
export declare function issue(id: string, category: string, priority: TSAIssue["priority"], title: string, howToFix: string, evidence: string[], appliesTo: TSAIssue["appliesTo"]): TSAIssue;
export declare function score(issues: TSAIssue[]): number;
export declare function parseJsonFlag<T>(value: string, fallback: T): T;
//# sourceMappingURL=trust-audit.d.ts.map