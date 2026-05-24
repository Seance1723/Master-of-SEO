import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { SeoGroup, SeoMemory, TaskLog } from "../types/index.ts";
import { memoryPath } from "./paths.ts";

export async function readMemory(path = memoryPath): Promise<SeoMemory> {
  return JSON.parse(await readFile(path, "utf8")) as SeoMemory;
}

export async function writeMemory(memory: SeoMemory, path = memoryPath): Promise<SeoMemory> {
  const updated: SeoMemory = {
    ...memory,
    lastUpdated: new Date().toISOString()
  };
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  return updated;
}

export async function updateGroupStatus(groupId: string, status: SeoGroup["status"], path = memoryPath): Promise<SeoMemory> {
  const memory = await readMemory(path);
  const groups = memory.groups.map((group) => (group.id === groupId ? { ...group, status } : group));
  const activeGroup = groups.find((group) => group.id === groupId) ?? memory.activeGroup;
  return writeMemory({ ...memory, groups, activeGroup }, path);
}

export function getNextGroupFromMemory(memory: SeoMemory): SeoGroup | undefined {
  return memory.groups.find((group) => group.status === "next") ?? memory.groups.find((group) => group.status === "planned");
}

export async function getNextGroup(path = memoryPath): Promise<SeoGroup | undefined> {
  return getNextGroupFromMemory(await readMemory(path));
}

export async function markGroupComplete(groupId: string, path = memoryPath): Promise<SeoMemory> {
  const memory = await readMemory(path);
  const completed = memory.groups.find((group) => group.id === groupId);
  const groups = memory.groups.map((group) => {
    if (group.id === groupId) return { ...group, status: "completed" as const };
    if (group.status === "next") return { ...group, status: "planned" as const };
    return group;
  });
  const next = groups.find((group) => group.status === "planned");
  const finalGroups = next ? groups.map((group) => (group.id === next.id ? { ...group, status: "next" as const } : group)) : groups;
  const completedGroups = completed
    ? [...memory.completedGroups.filter((group) => group.id !== completed.id), { ...completed, status: "completed" as const }]
    : memory.completedGroups;

  return writeMemory({
    ...memory,
    currentGroup: next ? next.name : memory.currentGroup,
    completedGroups,
    activeGroup: next ? { ...next, status: "next" } : memory.activeGroup,
    groups: finalGroups
  }, path);
}

export async function addTaskLog(message: string, path = memoryPath): Promise<SeoMemory> {
  const memory = await readMemory(path);
  const taskLog: TaskLog[] = [...(memory.taskLog ?? []), { timestamp: new Date().toISOString(), message }];
  return writeMemory({ ...memory, taskLog }, path);
}
