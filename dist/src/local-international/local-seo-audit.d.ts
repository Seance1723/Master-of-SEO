import type { LocalInternationalIssue, LocalInternationalSEOOutput, LocalSEOAuditInput } from "../types/local-international.ts";
export declare function runLocalSEOAudit(input: LocalSEOAuditInput): LocalInternationalSEOOutput;
export declare function parseLocalSEOInputFromText(rawInput: string): LocalSEOAuditInput;
export declare function needsInput(kind: "local" | "international"): LocalInternationalSEOOutput;
export declare function issue(id: string, category: string, priority: LocalInternationalIssue["priority"], title: string, howToFix: string, evidence: string[], appliesTo: LocalInternationalIssue["appliesTo"]): LocalInternationalIssue;
export declare function score(issues: LocalInternationalIssue[]): number;
export declare function parseJsonFlag<T>(value: string, fallback: T): T;
//# sourceMappingURL=local-seo-audit.d.ts.map