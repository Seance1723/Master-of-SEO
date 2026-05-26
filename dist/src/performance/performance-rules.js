import { join } from "node:path";
import { dataDir } from "../core/paths.js";
import { readJsonFile } from "../core/file-json.js";
const ruleFiles = [
    "performance-rules.json",
    "core-web-vitals-rules.json",
    "asset-optimization-rules.json",
    "image-performance-rules.json",
    "font-performance-rules.json",
    "javascript-performance-rules.json",
    "css-performance-rules.json",
    "third-party-script-rules.json",
    "server-response-rules.json"
];
export async function getPerformanceRules() {
    const groups = await Promise.all(ruleFiles.map((file) => readJsonFile(join(dataDir, file))));
    return groups.flat();
}
//# sourceMappingURL=performance-rules.js.map