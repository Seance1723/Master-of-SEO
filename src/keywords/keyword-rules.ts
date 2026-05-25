import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import { readJsonFile } from "../core/file-json.ts";
import type { KeywordRule } from "../types/keywords.ts";

const ruleFiles = ["keyword-rules.json", "keyword-intent-rules.json", "keyword-clustering-rules.json", "keyword-difficulty-rules.json", "funnel-stage-rules.json", "keyword-priority-rules.json"];

export async function getKeywordRules(): Promise<KeywordRule[]> {
  const groups = await Promise.all(ruleFiles.map((file) => readJsonFile<KeywordRule[]>(join(dataDir, file))));
  return groups.flat();
}
