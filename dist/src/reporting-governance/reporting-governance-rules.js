import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
export async function getReportingGovernanceRules() {
    return JSON.parse(await readFile(join(dataDir, "measurement-rules.json"), "utf8"));
}
//# sourceMappingURL=reporting-governance-rules.js.map