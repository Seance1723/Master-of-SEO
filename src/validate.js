import { access, readFile } from "node:fs/promises";
import { ACTIONS } from "./actions.js";
import { MEMORY_PATH, README_PATH, SKILL_DIR } from "./paths.js";

const requiredFiles = [
  "package.json",
  "README.md",
  "src/mcp-server.js",
  "src/cli.js",
  "skills/seo-master/SKILL.md",
  "skills/seo-master/references/actions.md",
  "skills/seo-master/references/project-memory.md",
  ...ACTIONS.map((action) => action.reference)
];

for (const file of requiredFiles) {
  await access(file);
}

const skill = await readFile(`${SKILL_DIR}/SKILL.md`, "utf8");
if (!skill.includes("/seo-master")) throw new Error("SKILL.md must mention /seo-master.");
if (!skill.includes("inactive")) throw new Error("SKILL.md must state the skill stays inactive.");

const memory = await readFile(MEMORY_PATH, "utf8");
if (!memory.includes("Read Before Next Group")) throw new Error("project-memory.md must include read-before-next-group guidance.");

const readme = await readFile(README_PATH, "utf8");
if (!readme.includes("master-of-seo")) throw new Error("README.md must document the npm package target.");

console.log(`Validated ${requiredFiles.length} files and ${ACTIONS.length} actions.`);
