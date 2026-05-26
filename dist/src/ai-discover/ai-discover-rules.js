import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
export async function getAIDiscoverRules() {
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
    ].map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return rules.flat();
}
//# sourceMappingURL=ai-discover-rules.js.map