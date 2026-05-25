import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import { readJsonFile } from "../core/file-json.ts";
import type { ContentRule } from "../types/content.ts";

const ruleFiles = ["content-rules.json", "topic-cluster-rules.json", "content-brief-rules.json", "content-refresh-rules.json", "content-pruning-rules.json", "content-calendar-rules.json", "content-quality-rules.json"];

export async function getContentRules(): Promise<ContentRule[]> {
  const groups = await Promise.all(ruleFiles.map((file) => readJsonFile<ContentRule[]>(join(dataDir, file))));
  return groups.flat();
}
