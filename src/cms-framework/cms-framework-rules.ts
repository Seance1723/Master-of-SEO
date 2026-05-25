import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.ts";
import type { SeoRule } from "../types/index.ts";

export async function getCMSFrameworkRules(): Promise<SeoRule[]> {
  const files = [
    "cms-framework-rules.json",
    "wordpress-seo-rules.json",
    "wordpress-permalink-rules.json",
    "wordpress-archive-rules.json",
    "wordpress-plugin-conflict-rules.json",
    "react-seo-rules.json",
    "nextjs-seo-rules.json",
    "static-seo-rules.json",
    "spa-seo-risk-rules.json",
    "ssr-ssg-rules.json",
    "metadata-rules.json",
    "route-level-seo-rules.json",
    "sitemap-generation-rules.json",
    "robots-generation-rules.json",
    "canonical-generation-rules.json",
    "social-metadata-rules.json",
    "jsonld-rendering-rules.json",
    "build-seo-rules.json"
  ];
  const groups = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8")) as SeoRule[]));
  return groups.flat();
}
