import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
const ruleFiles = [
    "media-rules.json",
    "image-seo-rules.json",
    "image-alt-rules.json",
    "image-filename-rules.json",
    "image-format-rules.json",
    "responsive-image-rules.json",
    "open-graph-image-rules.json",
    "video-seo-rules.json",
    "video-transcript-rules.json",
    "video-thumbnail-rules.json",
    "media-accessibility-rules.json"
];
export async function getMediaRules() {
    const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return groups.flat();
}
//# sourceMappingURL=media-rules.js.map