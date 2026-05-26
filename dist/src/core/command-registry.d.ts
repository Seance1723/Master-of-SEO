import type { SeoCommand } from "../types/index.ts";
export declare function getCommands(): Promise<SeoCommand[]>;
export declare function getCommandById(id: string): Promise<SeoCommand | undefined>;
export declare function getCommandFromInput(commandName?: string): Promise<SeoCommand | undefined>;
export declare function getCommandMenu(): Promise<string>;
//# sourceMappingURL=command-registry.d.ts.map