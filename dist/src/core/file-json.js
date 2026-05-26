import { readFile } from "node:fs/promises";
export async function readJsonFile(path) {
    return JSON.parse(await readFile(path, "utf8"));
}
//# sourceMappingURL=file-json.js.map