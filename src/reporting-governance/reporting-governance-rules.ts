import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.ts";

export async function getReportingGovernanceRules(): Promise<unknown> {
  return JSON.parse(await readFile(join(dataDir, "measurement-rules.json"), "utf8")) as unknown;
}

