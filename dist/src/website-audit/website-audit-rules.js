import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
const ruleFiles = [
    "website-audit-rules.json",
    "audit-priority-rules.json",
    "audit-roadmap-rules.json",
    "audit-template-rules.json"
];
export async function getWebsiteAuditRules() {
    const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return groups.flat();
}
//# sourceMappingURL=website-audit-rules.js.map