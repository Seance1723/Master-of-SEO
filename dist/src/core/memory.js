import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { memoryPath } from "./paths.js";
export async function readMemory(path = memoryPath) {
    return JSON.parse(await readFile(path, "utf8"));
}
export async function writeMemory(memory, path = memoryPath) {
    const updated = {
        ...memory,
        lastUpdated: new Date().toISOString()
    };
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    return updated;
}
export async function updateGroupStatus(groupId, status, path = memoryPath) {
    const memory = await readMemory(path);
    const groups = memory.groups.map((group) => (group.id === groupId ? { ...group, status } : group));
    const activeGroup = groups.find((group) => group.id === groupId) ?? memory.activeGroup;
    return writeMemory({ ...memory, groups, activeGroup }, path);
}
export function getNextGroupFromMemory(memory) {
    return memory.groups.find((group) => group.status === "next") ?? memory.groups.find((group) => group.status === "planned");
}
export async function getNextGroup(path = memoryPath) {
    return getNextGroupFromMemory(await readMemory(path));
}
export async function markGroupComplete(groupId, path = memoryPath) {
    const memory = await readMemory(path);
    const completed = memory.groups.find((group) => group.id === groupId);
    const groups = memory.groups.map((group) => {
        if (group.id === groupId)
            return { ...group, status: "completed" };
        if (group.status === "next")
            return { ...group, status: "planned" };
        return group;
    });
    const next = groups.find((group) => group.status === "planned");
    const finalGroups = next ? groups.map((group) => (group.id === next.id ? { ...group, status: "next" } : group)) : groups;
    const completedGroups = completed
        ? [...memory.completedGroups.filter((group) => group.id !== completed.id), { ...completed, status: "completed" }]
        : memory.completedGroups;
    return writeMemory({
        ...memory,
        currentGroup: next ? next.name : memory.currentGroup,
        completedGroups,
        activeGroup: next ? { ...next, status: "next" } : memory.activeGroup,
        groups: finalGroups
    }, path);
}
export async function addTaskLog(message, path = memoryPath) {
    const memory = await readMemory(path);
    const taskLog = [...(memory.taskLog ?? []), { timestamp: new Date().toISOString(), message }];
    return writeMemory({ ...memory, taskLog }, path);
}
//# sourceMappingURL=memory.js.map