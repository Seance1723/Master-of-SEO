import { join } from "node:path";
import type { TechnicalRule } from "../types/technical.ts";
import { dataDir } from "../core/paths.ts";
import { readJsonFile } from "../core/file-json.ts";

const ruleFiles = [
  "search-essentials-rules.json",
  "spam-policy-rules.json",
  "crawlability-rules.json",
  "indexability-rules.json",
  "robots-rules.json",
  "sitemap-rules.json",
  "canonical-rules.json",
  "redirect-rules.json",
  "status-code-rules.json",
  "technical-rules.json"
];

export async function getTechnicalRules(): Promise<TechnicalRule[]> {
  const groups = await Promise.all(ruleFiles.map((file) => readJsonFile<TechnicalRule[]>(join(dataDir, file))));
  return groups.flat();
}
