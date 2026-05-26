#!/usr/bin/env node
import { runSeoMaster } from "../core/orchestrator.js";
const args = process.argv.slice(2);
async function main() {
    if (args[0] === "mcp") {
        await import("../mcp/server.js");
        return;
    }
    const input = args.length ? args.join(" ") : "/seo-master help";
    const result = await runSeoMaster(input);
    console.log(result.message);
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map