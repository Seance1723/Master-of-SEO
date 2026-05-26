import { join } from "node:path";
import { dataDir } from "../core/paths.js";
import { readJsonFile } from "../core/file-json.js";
const ruleFiles = ["content-rules.json", "topic-cluster-rules.json", "content-brief-rules.json", "content-refresh-rules.json", "content-pruning-rules.json", "content-calendar-rules.json", "content-quality-rules.json"];
export async function getContentRules() {
    const groups = await Promise.all(ruleFiles.map((file) => readJsonFile(join(dataDir, file))));
    return groups.flat();
}
//# sourceMappingURL=content-rules.js.map