import { join } from "node:path";
import { dataDir } from "./paths.js";
import { readJsonFile } from "./file-json.js";
export async function getScoreWeights() {
    return readJsonFile(join(dataDir, "score-weights.json"));
}
export function getScoreWeightTotal(weights) {
    return Object.values(weights).reduce((sum, value) => sum + value, 0);
}
export async function validateScoreWeights() {
    return getScoreWeightTotal(await getScoreWeights()) === 100;
}
//# sourceMappingURL=score-engine.js.map