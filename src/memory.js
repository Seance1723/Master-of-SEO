import { readFile, writeFile } from "node:fs/promises";
import { MEMORY_PATH, README_PATH } from "./paths.js";

export async function readMemory() {
  return readFile(MEMORY_PATH, "utf8");
}

export async function updateMemory(note) {
  const current = await readMemory();
  const entry = `\n## Memory Update - ${new Date().toISOString()}\n\n${String(note).trim()}\n`;
  await writeFile(MEMORY_PATH, `${current.trimEnd()}\n${entry}`, "utf8");
  return readMemory();
}

export async function updateReadmeStatus({ completedGroup, nextAction }) {
  const readme = await readFile(README_PATH, "utf8");
  const replacement = [
    "## Current Status",
    "",
    `- Completed group: ${completedGroup || "not specified"}`,
    "- Memory updated: yes",
    "- README updated: yes",
    `- Next action: ${nextAction || "read project memory, then choose the next /seo-master action"}`
  ].join("\n");

  const updated = readme.includes("## Current Status")
    ? readme.replace(/## Current Status[\s\S]*$/u, replacement)
    : `${readme.trimEnd()}\n\n${replacement}\n`;

  await writeFile(README_PATH, `${updated.trimEnd()}\n`, "utf8");
  return replacement;
}
