import { join } from "node:path";
import { dataDir } from "../core/paths.js";
import { readJsonFile } from "../core/file-json.js";
const ruleFiles = [
    "on-page-rules.json",
    "title-tag-rules.json",
    "meta-description-rules.json",
    "heading-rules.json",
    "content-structure-rules.json",
    "cta-conversion-rules.json",
    "image-alt-rules.json"
];
export async function getOnPageRules() {
    const groups = await Promise.all(ruleFiles.map((file) => readJsonFile(join(dataDir, file))));
    return groups.flat();
}
//# sourceMappingURL=on-page-rules.js.map