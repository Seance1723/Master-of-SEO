import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
const ruleFiles = ["strategy-rules.json", "seo-plan-rules.json", "campaign-planning-rules.json", "goal-mapping-rules.json", "opportunity-priority-rules.json", "impact-effort-rules.json", "roadmap-rules.json", "launch-checklist-rules.json", "migration-plan-rules.json", "resource-capacity-rules.json", "seo-risk-rules.json"];
export async function getStrategyRules() {
    const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return groups.flat();
}
//# sourceMappingURL=strategy-rules.js.map