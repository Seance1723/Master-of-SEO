import type { AISearchAuditInput, AISearchDiscoverIssue, AISearchDiscoverOutput } from "../types/ai-discover.ts";
export declare function runAISearchAudit(input: AISearchAuditInput): AISearchDiscoverOutput;
export declare function parseAISearchInputFromText(rawInput: string): AISearchAuditInput;
export declare function needsAISearchInput(): AISearchDiscoverOutput;
export declare function issue(id: string, category: string, priority: AISearchDiscoverIssue["priority"], title: string, howToFix: string, evidence: string[], appliesTo: AISearchDiscoverIssue["appliesTo"]): AISearchDiscoverIssue;
export declare function score(issues: AISearchDiscoverIssue[]): number;
export declare function parseJsonFlag<T>(value: string, fallback: T): T;
//# sourceMappingURL=ai-search-audit.d.ts.map