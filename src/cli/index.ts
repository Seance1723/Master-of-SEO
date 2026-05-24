#!/usr/bin/env node
import { runSeoMaster } from "../core/orchestrator.ts";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args[0] === "mcp") {
    await import("../mcp/server.ts");
    return;
  }

  const input = args.length ? args.join(" ") : "/seo-master help";
  const result = await runSeoMaster(input);
  console.log(result.message);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
