import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import type { SeoRule } from "../types/index.ts";

const ruleFiles = [
  "competitor-rules.json",
  "competitor-type-rules.json",
  "competitor-serp-rules.json",
  "competitor-keyword-gap-rules.json",
  "competitor-content-gap-rules.json",
  "competitor-backlink-gap-rules.json",
  "competitor-page-structure-rules.json",
  "competitor-metadata-rules.json",
  "competitor-schema-rules.json",
  "competitor-ux-conversion-rules.json",
  "serp-feature-opportunity-rules.json",
  "competitor-priority-rules.json"
];

export async function getCompetitorRules(): Promise<SeoRule[]> {
  const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8")) as SeoRule[]));
  return groups.flat();
}
