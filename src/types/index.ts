export type CommandStatus = "planned" | "active";
export type PriorityLabel = "P0" | "P1" | "P2" | "P3";
export type RuleStatus = "active" | "planned";

export interface SeoCommand {
  id: string;
  command: string;
  title: string;
  description: string;
  group: string;
  status: CommandStatus;
  requiredInputs: string[];
  outputType: string;
}

export interface TriggerResult {
  state: "inactive" | "menu" | "active";
  rawInput: string;
  commandName?: string;
  args: string[];
  message?: string;
}

export interface OrchestratorResponse {
  active: boolean;
  type: "inactive" | "menu" | "help" | "memory" | "next-group" | "technical-audit" | "performance-audit" | "on-page-audit" | "keyword-research" | "content-plan" | "architecture-audit" | "schema-audit" | "schema-generate" | "media-audit" | "ecommerce-audit" | "local-international-audit" | "planned" | "error";
  command?: SeoCommand;
  message: string;
  data?: unknown;
}

export interface SeoGroup {
  id: string;
  name: string;
  status: "planned" | "in_progress" | "completed" | "next";
}

export interface TaskLog {
  timestamp: string;
  message: string;
}

export interface SeoMemory {
  projectName: string;
  packageName: string;
  currentGroup: string;
  currentVersion: string;
  completedGroups: SeoGroup[];
  activeGroup: SeoGroup;
  implementationRules: string[];
  groups: SeoGroup[];
  taskLog: TaskLog[];
  lastUpdated: string;
}

export interface SeoRule {
  id: string;
  group: string;
  category: string;
  title: string;
  description: string;
  do: string[];
  dont: string[];
  priority: PriorityLabel;
  appliesTo: Array<"website" | "page" | "content" | "technical" | "audit" | "planning">;
  status: RuleStatus;
}

export interface DetectionResult<T extends string> {
  type: T;
  confidence: number;
  matchedSignals: string[];
}
