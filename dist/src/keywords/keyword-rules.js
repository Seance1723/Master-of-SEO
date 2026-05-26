import { join } from "node:path";
import { dataDir } from "../core/paths.js";
import { readJsonFile } from "../core/file-json.js";
const ruleFiles = ["keyword-rules.json", "keyword-intent-rules.json", "keyword-clustering-rules.json", "keyword-difficulty-rules.json", "funnel-stage-rules.json", "keyword-priority-rules.json"];
export async function getKeywordRules() {
    const groups = await Promise.all(ruleFiles.map((file) => readJsonFile(join(dataDir, file))));
    return groups.flat();
}
//# sourceMappingURL=keyword-rules.js.map