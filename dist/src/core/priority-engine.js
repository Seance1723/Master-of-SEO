import { join } from "node:path";
import { dataDir } from "./paths.js";
import { readJsonFile } from "./file-json.js";
export async function getPriorities() {
    return readJsonFile(join(dataDir, "priorities.json"));
}
export async function getPriority(label) {
    return (await getPriorities()).find((priority) => priority.label === label);
}
//# sourceMappingURL=priority-engine.js.map