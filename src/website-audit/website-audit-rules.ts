import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import type { SeoRule } from "../types/index.ts";

const ruleFiles = [
  "website-audit-rules.json",
  "audit-priority-rules.json",
  "audit-roadmap-rules.json",
  "audit-template-rules.json"
];

export async function getWebsiteAuditRules(): Promise<SeoRule[]> {
  const groups = await Promise.all(
    ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8")) as SeoRule[])
  );
  return groups.flat();
}
