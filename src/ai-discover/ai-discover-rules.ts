import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SeoRule } from "../types/index.ts";
import { dataDir } from "../core/paths.ts";

export async function getAIDiscoverRules(): Promise<SeoRule[]> {
  const rules = await Promise.all([
    "ai-search-rules.json",
    "generative-search-content-rules.json",
    "answer-block-rules.json",
    "conversational-query-rules.json",
    "snippet-eligibility-rules.json",
    "entity-clarity-rules.json",
    "information-gain-rules.json",
    "citation-quality-rules.json",
    "ai-content-quality-rules.json",
    "discover-seo-rules.json",
    "news-publisher-rules.json",
    "large-image-preview-rules.json",
    "discover-title-thumbnail-rules.json"
  ].map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8")) as SeoRule[]));
  return rules.flat();
}
