import { join } from "node:path";
import { dataDir } from "../core/paths.js";
import { readJsonFile } from "../core/file-json.js";
const ruleFiles = ["architecture-rules.json", "url-hierarchy-rules.json", "navigation-rules.json", "crawl-depth-rules.json", "orphan-page-rules.json", "internal-linking-rules.json", "anchor-text-rules.json", "breadcrumb-rules.json", "topic-cluster-linking-rules.json"];
export async function getArchitectureRules() {
    const groups = await Promise.all(ruleFiles.map((file) => readJsonFile(join(dataDir, file))));
    return groups.flat();
}
//# sourceMappingURL=architecture-rules.js.map