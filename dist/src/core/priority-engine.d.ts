import type { PriorityLabel } from "../types/index.ts";
export interface PriorityDefinition {
    label: PriorityLabel;
    name: string;
    description: string;
}
export declare function getPriorities(): Promise<PriorityDefinition[]>;
export declare function getPriority(label: PriorityLabel): Promise<PriorityDefinition | undefined>;
//# sourceMappingURL=priority-engine.d.ts.map