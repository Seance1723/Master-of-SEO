import type { SeoGroup, SeoMemory } from "../types/index.ts";
export declare function readMemory(path?: string): Promise<SeoMemory>;
export declare function writeMemory(memory: SeoMemory, path?: string): Promise<SeoMemory>;
export declare function updateGroupStatus(groupId: string, status: SeoGroup["status"], path?: string): Promise<SeoMemory>;
export declare function getNextGroupFromMemory(memory: SeoMemory): SeoGroup | undefined;
export declare function getNextGroup(path?: string): Promise<SeoGroup | undefined>;
export declare function markGroupComplete(groupId: string, path?: string): Promise<SeoMemory>;
export declare function addTaskLog(message: string, path?: string): Promise<SeoMemory>;
//# sourceMappingURL=memory.d.ts.map