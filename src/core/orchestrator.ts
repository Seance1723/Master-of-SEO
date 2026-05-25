import type { OrchestratorResponse } from "../types/index.ts";
import { runAIContentQualityAudit } from "../ai-discover/ai-generated-content-quality-guard.ts";
import { parseAISearchInputFromText, runAISearchAudit } from "../ai-discover/ai-search-audit.ts";
import { runAnswerBlockAudit } from "../ai-discover/answer-block.ts";
import { parseDiscoverInputFromText, runDiscoverSEOAudit } from "../ai-discover/discover-seo-audit.ts";
import { parseArchitectureAuditInputFromText, runArchitectureAudit } from "../architecture/architecture-audit.ts";
import { parseContentPlanInputFromText, runContentPlan } from "../content/content-plan.ts";
import { runCategorySeoAudit } from "../ecommerce/category-seo.ts";
import { parseEcommerceAuditInputFromText, runEcommerceAudit } from "../ecommerce/ecommerce-audit.ts";
import { runProductSeoAudit } from "../ecommerce/product-seo.ts";
import { parseKeywordResearchInputFromText, runKeywordResearch } from "../keywords/keyword-research.ts";
import { parseInternationalSEOInputFromText, runHreflangAudit, runInternationalSEOAudit } from "../local-international/international-seo-audit.ts";
import { parseLocalSEOInputFromText, runLocalSEOAudit } from "../local-international/local-seo-audit.ts";
import { runImageSeoAudit } from "../media/image-seo.ts";
import { parseMediaAuditInputFromText, runMediaAudit } from "../media/media-audit.ts";
import { runVideoSeoAudit } from "../media/video-seo.ts";
import { parseOnPageAuditInputFromText, runOnPageAudit } from "../on-page/on-page-audit.ts";
import { parsePerformanceAuditInputFromText, runPerformanceAudit } from "../performance/performance-audit.ts";
import { parseSchemaInputFromText, runSchemaAudit } from "../schema/schema-audit.ts";
import { runSchemaGenerate } from "../schema/schema-generate.ts";
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

  if (command.id === "schema-audit") {
    const report = runSchemaAudit(parseSchemaInputFromText(input));
    return {
      active: true,
      type: "schema-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "schema-generate") {
    const report = runSchemaGenerate(parseSchemaInputFromText(input));
    return {
      active: true,
      type: "schema-generate",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "media-audit" || command.id === "image-seo-audit" || command.id === "video-seo-audit") {
    const parsed = parseMediaAuditInputFromText(input);
    const report = command.id === "image-seo-audit" ? runImageSeoAudit(parsed) : command.id === "video-seo-audit" ? runVideoSeoAudit(parsed) : runMediaAudit(parsed);
    return {
      active: true,
      type: "media-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "ecommerce-seo" || command.id === "ecommerce-audit" || command.id === "product-seo-audit" || command.id === "category-seo-audit") {
    const parsed = parseEcommerceAuditInputFromText(input);
    const report = command.id === "product-seo-audit" ? runProductSeoAudit(parsed) : command.id === "category-seo-audit" ? runCategorySeoAudit(parsed) : runEcommerceAudit(parsed);
    return {
      active: true,
      type: "ecommerce-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "local-seo" || command.id === "local-seo-audit") {
    const report = runLocalSEOAudit(parseLocalSEOInputFromText(input));
    return {
      active: true,
      type: "local-international-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "international-seo" || command.id === "international-seo-audit" || command.id === "hreflang-audit") {
    const parsed = parseInternationalSEOInputFromText(input);
    const report = command.id === "hreflang-audit" ? runHreflangAudit(parsed) : runInternationalSEOAudit(parsed);
    return {
      active: true,
      type: "local-international-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "ai-search-readiness" || command.id === "ai-search-audit" || command.id === "answer-block-audit" || command.id === "ai-content-quality-audit") {
    const parsed = parseAISearchInputFromText(input);
    const report = command.id === "answer-block-audit" ? runAnswerBlockAudit(parsed) : command.id === "ai-content-quality-audit" ? runAIContentQualityAudit(parsed) : runAISearchAudit(parsed);
    return {
      active: true,
      type: "ai-discover-audit",
      command,
      data: report,
      message: JSON.stringify(report, null, 2)
    };
  }

  if (command.id === "discover-seo-audit") {
    const report = runDiscoverSEOAudit(parseDiscoverInputFromText(input));
    return {
      active: true,
      type: "ai-discover-audit",
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
