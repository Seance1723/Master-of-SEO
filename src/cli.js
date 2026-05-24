#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { ACTIONS, findAction, formatActions } from "./actions.js";
import { readMemory, updateMemory, updateReadmeStatus } from "./memory.js";
import { ROOT } from "./paths.js";

const [, , command, ...args] = process.argv;

async function main() {
  if (!command || command === "help" || command === "/") {
    console.log("Master of SEO commands:");
    console.log("  actions                  List /seo-master actions");
    console.log("  memory                   Read project memory");
    console.log("  action <name>            Print a modular action file");
    console.log("  remember <note>          Append a project memory note");
    console.log("  complete <group> [next]  Update memory and README status");
    console.log("  mcp                      Start the MCP server");
    return;
  }

  if (command === "actions") {
    console.log(formatActions());
    return;
  }

  if (command === "memory") {
    console.log(await readMemory());
    return;
  }

  if (command === "action") {
    const action = findAction(args[0]);
    if (!action) throw new Error(`Unknown action. Available actions:\n${ACTIONS.map((item) => item.name).join(", ")}`);
    console.log(await readFile(`${ROOT}/${action.reference}`, "utf8"));
    return;
  }

  if (command === "remember") {
    console.log(await updateMemory(args.join(" ")));
    return;
  }

  if (command === "complete") {
    const completedGroup = args[0] || "completed module";
    const nextAction = args.slice(1).join(" ") || "read memory, then choose the next /seo-master action";
    await updateMemory(`Completed group/module: ${completedGroup}\nNext action: ${nextAction}`);
    console.log(await updateReadmeStatus({ completedGroup, nextAction }));
    return;
  }

  if (command === "mcp") {
    await import("./mcp-server.js");
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
