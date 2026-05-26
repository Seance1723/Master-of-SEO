import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
function findPackageRoot(start) {
    let current = start;
    while (current !== dirname(current)) {
        if (existsSync(join(current, "package.json")))
            return current;
        current = dirname(current);
    }
    return start;
}
export const rootDir = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
export const dataDir = join(rootDir, "src", "data");
export const memoryPath = join(rootDir, "memory", "master-of-seo.memory.json");
//# sourceMappingURL=paths.js.map