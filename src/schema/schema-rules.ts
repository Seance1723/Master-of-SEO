import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import type { SchemaRule } from "../types/schema.ts";

const ruleFiles = [
  "schema-rules.json",
  "rich-result-rules.json",
  "entity-seo-rules.json",
  "organization-schema-rules.json",
  "website-schema-rules.json",
  "breadcrumb-schema-rules.json",
  "article-schema-rules.json",
  "product-schema-rules.json",
  "service-schema-rules.json",
  "software-application-schema-rules.json",
  "local-business-schema-rules.json",
  "faq-schema-rules.json",
  "video-schema-rules.json",
  "job-posting-schema-rules.json"
];

export async function getSchemaRules(): Promise<SchemaRule[]> {
  const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8")) as SchemaRule[]));
  return groups.flat();
}
