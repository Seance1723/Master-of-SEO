import type { TriggerResult } from "../types/index.ts";

export function checkTrigger(input: string): TriggerResult {
  const rawInput = input.trim();
  const lowerInput = rawInput.toLowerCase();
  const explicitNaturalActivation = /\b(use seo-master|use master of seo|apply seo-master skills)\b/u.test(lowerInput);

  if (!rawInput.startsWith("/") && !explicitNaturalActivation) {
    return {
      state: "inactive",
      rawInput,
      args: [],
      message: "inactive"
    };
  }

  if (explicitNaturalActivation && !rawInput.startsWith("/")) {
    return {
      state: "active",
      rawInput,
      commandName: inferNaturalCommand(lowerInput),
      args: rawInput.split(/\s+/u).filter(Boolean)
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

function inferNaturalCommand(input: string): string {
  if (/\b(keyword|keywords|intent)\b/u.test(input)) return "keyword-research";
  if (/\b(competitor|serp)\b/u.test(input)) return "competitor-analysis";
  if (/\b(plan|strategy|roadmap)\b/u.test(input)) return "seo-plan";
  if (/\b(report|measurement|governance)\b/u.test(input)) return "report";
  if (/\b(qa|release)\b/u.test(input)) return "seo-qa";
  if (/\b(technical|html|audit|website|site|wrong)\b/u.test(input)) return "audit-website";
  return "help";
}
