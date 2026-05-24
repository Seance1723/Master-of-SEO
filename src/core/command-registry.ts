import { join } from "node:path";
import type { SeoCommand } from "../types/index.ts";
import { dataDir } from "./paths.ts";
import { readJsonFile } from "./file-json.ts";

let cache: SeoCommand[] | undefined;

export async function getCommands(): Promise<SeoCommand[]> {
  cache ??= await readJsonFile<SeoCommand[]>(join(dataDir, "commands.json"));
  return cache;
}

export async function getCommandById(id: string): Promise<SeoCommand | undefined> {
  const commands = await getCommands();
  return commands.find((command) => command.id === id);
}

export async function getCommandFromInput(commandName = "help"): Promise<SeoCommand | undefined> {
  const normalized = commandName.trim().replace(/^\/seo-master\s*/u, "").replace(/^\//u, "") || "help";
  return getCommandById(normalized);
}

export async function getCommandMenu(): Promise<string> {
  const commands = await getCommands();
  return commands.map((command) => `${command.command} [${command.status}] - ${command.title}: ${command.description}`).join("\n");
}
