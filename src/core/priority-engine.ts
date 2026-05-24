import { join } from "node:path";
import type { PriorityLabel } from "../types/index.ts";
import { dataDir } from "./paths.ts";
import { readJsonFile } from "./file-json.ts";

export interface PriorityDefinition {
  label: PriorityLabel;
  name: string;
  description: string;
}

export async function getPriorities(): Promise<PriorityDefinition[]> {
  return readJsonFile<PriorityDefinition[]>(join(dataDir, "priorities.json"));
}

export async function getPriority(label: PriorityLabel): Promise<PriorityDefinition | undefined> {
  return (await getPriorities()).find((priority) => priority.label === label);
}
