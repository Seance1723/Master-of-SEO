import type { TriggerResult } from "../types/index.ts";

export function checkTrigger(input: string): TriggerResult {
  const rawInput = input.trim();

  if (!rawInput.startsWith("/")) {
    return {
      state: "inactive",
      rawInput,
      args: [],
      message: "inactive"
    };
  }

  if (rawInput === "/" || !rawInput.startsWith("/seo-master")) {
    return {
      state: "menu",
      rawInput,
      args: []
    };
  }

  const parts = rawInput.split(/\s+/u).filter(Boolean);
  const commandName = parts[1] || "help";

  return {
    state: "active",
    rawInput,
    commandName,
    args: parts.slice(2)
  };
}
