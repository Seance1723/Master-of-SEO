import { join } from "node:path";
import { dataDir } from "./paths.ts";
import { readJsonFile } from "./file-json.ts";

export type ScoreWeights = Record<string, number>;

export async function getScoreWeights(): Promise<ScoreWeights> {
  return readJsonFile<ScoreWeights>(join(dataDir, "score-weights.json"));
}

export function getScoreWeightTotal(weights: ScoreWeights): number {
  return Object.values(weights).reduce((sum, value) => sum + value, 0);
}

export async function validateScoreWeights(): Promise<boolean> {
  return getScoreWeightTotal(await getScoreWeights()) === 100;
}
