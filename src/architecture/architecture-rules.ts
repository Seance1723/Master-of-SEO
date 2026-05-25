import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import { readJsonFile } from "../core/file-json.ts";
import type { ArchitectureRule } from "../types/architecture.ts";

const ruleFiles = ["architecture-rules.json", "url-hierarchy-rules.json", "navigation-rules.json", "crawl-depth-rules.json", "orphan-page-rules.json", "internal-linking-rules.json", "anchor-text-rules.json", "breadcrumb-rules.json", "topic-cluster-linking-rules.json"];

export async function getArchitectureRules(): Promise<ArchitectureRule[]> {
  const groups = await Promise.all(ruleFiles.map((file) => readJsonFile<ArchitectureRule[]>(join(dataDir, file))));
  return groups.flat();
}
