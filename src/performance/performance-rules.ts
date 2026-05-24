import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import { readJsonFile } from "../core/file-json.ts";
import type { PerformanceRule } from "../types/performance.ts";

const ruleFiles = [
  "performance-rules.json",
  "core-web-vitals-rules.json",
  "asset-optimization-rules.json",
  "image-performance-rules.json",
  "font-performance-rules.json",
  "javascript-performance-rules.json",
  "css-performance-rules.json",
  "third-party-script-rules.json",
  "server-response-rules.json"
];

export async function getPerformanceRules(): Promise<PerformanceRule[]> {
  const groups = await Promise.all(ruleFiles.map((file) => readJsonFile<PerformanceRule[]>(join(dataDir, file))));
  return groups.flat();
}
