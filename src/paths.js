import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const SKILL_DIR = join(ROOT, "skills", "seo-master");
export const REFERENCES_DIR = join(SKILL_DIR, "references");
export const MEMORY_PATH = join(REFERENCES_DIR, "project-memory.md");
export const README_PATH = join(ROOT, "README.md");
