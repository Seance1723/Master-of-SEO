import type { ArchitectureAuditInput, ArchitectureLink } from "../types/architecture.ts";
export interface LinkGraph {
    incoming: Map<string, ArchitectureLink[]>;
    outgoing: Map<string, ArchitectureLink[]>;
    distribution: Record<string, number>;
}
export declare function buildLinkGraph(input: ArchitectureAuditInput): LinkGraph;
//# sourceMappingURL=internal-linking.d.ts.map