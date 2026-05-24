import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import { readJsonFile } from "../core/file-json.ts";
import type { OnPageRule } from "../types/on-page.ts";

const ruleFiles = [
  "on-page-rules.json",
  "title-tag-rules.json",
  "meta-description-rules.json",
  "heading-rules.json",
  "content-structure-rules.json",
  "cta-conversion-rules.json",
  "image-alt-rules.json"
];

export async function getOnPageRules(): Promise<OnPageRule[]> {
  const groups = await Promise.all(ruleFiles.map((file) => readJsonFile<OnPageRule[]>(join(dataDir, file))));
  return groups.flat();
}
