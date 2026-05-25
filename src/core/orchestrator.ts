import type { OrchestratorResponse } from "../types/index.ts";
import { parseArchitectureAuditInputFromText, runArchitectureAudit } from "../architecture/architecture-audit.ts";
import { parseContentPlanInputFromText, runContentPlan } from "../content/content-plan.ts";
import { parseKeywordResearchInputFromText, runKeywordResearch } from "../keywords/keyword-research.ts";
import { parseOnPageAuditInputFromText, runOnPageAudit } from "../on-page/on-page-audit.ts";
import { parsePerformanceAuditInputFromText, runPerformanceAudit } from "../performance/performance-audit.ts";
import { parseTechnicalAuditInputFromText, runTechnicalAudit } from "../technical/technical-audit.ts";
import { getCommandFromInput, getCommandMenu } from "./command-registry.ts";
import { getNextGroupFromMemory, readMemory } from "./memory.ts";
import { checkTrigger } from "./trigger.ts";

export async function runSeoMaster(input: string): Promise<OrchestratorResponse> {
  const trigger = checkTrigger(input);

  if (trigger.state === "inactive") {
    return {
      active: false,
      type: "inactive",
      message: "inactive"
    };
  }

  if (trigger.state === "menu") {
    return {
      active: false,
      type: "menu",
      message: await getCommandMenu()
    };
  }

  const command = await getCommandFromInput(trigger.commandName);

  if (!command) {
    return {
      active: true,
      type: "error",
      message: `Unknown Master of SEO command. Available commands:\n${await getCommandMenu()}`
    };
  }

  if (command.status === "planned") {
    return {
      active: true,
      type: "planned",
      command,
      message: `${command.command} is planned for ${command.group}. This module is not implemented yet.`
    };
  }

  if (command.id === "technical-audit") {
    const report = runTechnicalAudit(parseTechnicalAuditInputFromText(input));
    return {
      active: true,
      type: "technical-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "performance-audit") {
    const report = runPerformanceAudit(parsePerformanceAuditInputFromText(input));
    return {
      active: true,
      type: "performance-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "on-page-audit") {
    const report = runOnPageAudit(parseOnPageAuditInputFromText(input));
    return {
      active: true,
      type: "on-page-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "keyword-research") {
    const report = runKeywordResearch(parseKeywordResearchInputFromText(input));
    return {
      active: true,
      type: "keyword-research",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "content-plan") {
    const report = runContentPlan(parseContentPlanInputFromText(input));
    return {
      active: true,
      type: "content-plan",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "architecture-audit" || command.id === "internal-linking-audit") {
    const report = runArchitectureAudit(parseArchitectureAuditInputFromText(input));
    return {
      active: true,
      type: "architecture-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "help") {
    return {
      active: true,
      type: "help",
      command,
      message: await getCommandMenu()
    };
  }

  if (command.id === "memory") {
    const memory = await readMemory();
    const nextGroup = getNextGroupFromMemory(memory);
    return {
      active: true,
      type: "memory",
      command,
      data: memory,
      message: [
        `Current group: ${memory.activeGroup.name} (${memory.activeGroup.status})`,
        `Completed groups: ${memory.completedGroups.map((group) => group.name).join(", ") || "None"}`,
        `Next group: ${nextGroup ? `${nextGroup.name} (${nextGroup.id})` : "None"}`,
        "Implementation rules:",
        ...memory.implementationRules.map((rule) => `- ${rule}`)
      ].join("\n")
    };
  }

  if (command.id === "next-group") {
    const nextGroup = getNextGroupFromMemory(await readMemory());
    return {
      active: true,
      type: "next-group",
      command,
      data: nextGroup,
      message: nextGroup ? `Next group: ${nextGroup.name} (${nextGroup.id})` : "No planned groups remain."
    };
  }

  return {
    active: true,
    type: "error",
    command,
    message: "Command is active but no handler is registered."
  };
}
