import type { ArchitectureAuditInput, ArchitectureIssue } from "../types/architecture.ts";
import type { LinkGraph } from "./internal-linking.ts";
export declare function detectOrphanPages(input: ArchitectureAuditInput, graph: LinkGraph): {
    orphanPages: string[];
    issues: ArchitectureIssue[];
};
//# sourceMappingURL=orphan-pages.d.ts.map