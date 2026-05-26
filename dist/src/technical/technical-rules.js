import { join } from "node:path";
import { dataDir } from "../core/paths.js";
import { readJsonFile } from "../core/file-json.js";
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
export async function getTechnicalRules() {
    const groups = await Promise.all(ruleFiles.map((file) => readJsonFile(join(dataDir, file))));
    return groups.flat();
}
//# sourceMappingURL=technical-rules.js.map