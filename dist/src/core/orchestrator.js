import { runAIContentQualityAudit } from "../ai-discover/ai-generated-content-quality-guard.js";
import { parseAISearchInputFromText, runAISearchAudit } from "../ai-discover/ai-search-audit.js";
import { runAnswerBlockAudit } from "../ai-discover/answer-block.js";
import { parseDiscoverInputFromText, runDiscoverSEOAudit } from "../ai-discover/discover-seo-audit.js";
import { parseArchitectureAuditInputFromText, runArchitectureAudit } from "../architecture/architecture-audit.js";
import { parseContentPlanInputFromText, runContentPlan } from "../content/content-plan.js";
import { runBuildSEOCheck } from "../cms-framework/build-seo-check.js";
import { parseCMSFrameworkInputFromText, runFrameworkSEOAudit } from "../cms-framework/framework-seo-audit.js";
import { runNextJSSEOAudit } from "../cms-framework/nextjs-seo-audit.js";
import { runReactSEOAudit } from "../cms-framework/react-seo-audit.js";
import { runStaticSEOAudit } from "../cms-framework/static-seo-audit.js";
import { runWordPressSEOAudit } from "../cms-framework/wordpress-seo-audit.js";
import { runCompetitorBacklinkGap } from "../competitors/competitor-backlink-gap.js";
import { runCompetitorContentGap } from "../competitors/competitor-content-gap.js";
import { parseCompetitorAnalysisInputFromText, runCompetitorAnalysis } from "../competitors/competitor-analysis.js";
import { runCompetitorKeywordGap } from "../competitors/competitor-keyword-gap.js";
import { runCompetitorSerpAnalysis } from "../competitors/competitor-serp-analysis.js";
import { runCategorySeoAudit } from "../ecommerce/category-seo.js";
import { parseEcommerceAuditInputFromText, runEcommerceAudit } from "../ecommerce/ecommerce-audit.js";
import { runProductSeoAudit } from "../ecommerce/product-seo.js";
import { parseKeywordResearchInputFromText, runKeywordResearch } from "../keywords/keyword-research.js";
import { parseInternationalSEOInputFromText, runHreflangAudit, runInternationalSEOAudit } from "../local-international/international-seo-audit.js";
import { parseLocalSEOInputFromText, runLocalSEOAudit } from "../local-international/local-seo-audit.js";
import { runImageSeoAudit } from "../media/image-seo.js";
import { parseMediaAuditInputFromText, runMediaAudit } from "../media/media-audit.js";
import { runVideoSeoAudit } from "../media/video-seo.js";
import { parseOnPageAuditInputFromText, runOnPageAudit } from "../on-page/on-page-audit.js";
import { parsePerformanceAuditInputFromText, runPerformanceAudit } from "../performance/performance-audit.js";
import { parseReportingGovernanceInputFromText, runSEOMeasurement } from "../reporting-governance/seo-measurement.js";
import { runSEOReport } from "../reporting-governance/seo-report-generator.js";
import { runSEOGovernance } from "../reporting-governance/seo-governance.js";
import { runSEOQAChecklist } from "../reporting-governance/seo-qa-checklist.js";
import { runReleaseSEOGuard } from "../reporting-governance/release-seo-guard.js";
import { runFinalMasterReport } from "../reporting-governance/final-master-report.js";
import { parseSchemaInputFromText, runSchemaAudit } from "../schema/schema-audit.js";
import { runSchemaGenerate } from "../schema/schema-generate.js";
import { runCampaignPlan } from "../strategy/campaign-plan.js";
import { runLaunchChecklist } from "../strategy/launch-checklist.js";
import { runMigrationPlan } from "../strategy/migration-plan.js";
import { runOpportunityPlan } from "../strategy/opportunity-prioritization.js";
import { runSEOPlan } from "../strategy/seo-plan.js";
import { parseSEOStrategyInputFromText, runSEOStrategy } from "../strategy/seo-strategy.js";
import { parseTechnicalAuditInputFromText, runTechnicalAudit } from "../technical/technical-audit.js";
import { parseAccessibilityInputFromText, runAccessibilityAudit } from "../trust-security-accessibility/accessibility-audit.js";
import { runEEATAudit } from "../trust-security-accessibility/eeat-audit.js";
import { parseSecurityInputFromText, runSecurityAudit } from "../trust-security-accessibility/security-audit.js";
import { parseTrustInputFromText, runTrustAudit } from "../trust-security-accessibility/trust-audit.js";
import { runPageAudit } from "../website-audit/page-audit.js";
import { parseWebsiteAuditInputFromText, runWebsiteAudit } from "../website-audit/website-audit.js";
import { getCommandFromInput, getCommandMenu } from "./command-registry.js";
import { getNextGroupFromMemory, readMemory } from "./memory.js";
import { checkTrigger } from "./trigger.js";
export async function runSeoMaster(input) {
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
    if (command.id === "trust-audit" || command.id === "eeat-audit") {
        const parsed = parseTrustInputFromText(input);
        const report = command.id === "eeat-audit" ? runEEATAudit(parsed) : runTrustAudit(parsed);
        return {
            active: true,
            type: "trust-security-accessibility-audit",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "security-audit") {
        const report = runSecurityAudit(parseSecurityInputFromText(input));
        return {
            active: true,
            type: "trust-security-accessibility-audit",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "accessibility-audit") {
        const report = runAccessibilityAudit(parseAccessibilityInputFromText(input));
        return {
            active: true,
            type: "trust-security-accessibility-audit",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "framework-seo-audit" || command.id === "wordpress-seo-audit" || command.id === "react-seo-audit" || command.id === "nextjs-seo-audit" || command.id === "static-seo-audit" || command.id === "build-seo-check") {
        const parsed = parseCMSFrameworkInputFromText(input);
        const report = command.id === "wordpress-seo-audit" ? runWordPressSEOAudit(parsed) : command.id === "react-seo-audit" ? runReactSEOAudit(parsed) : command.id === "nextjs-seo-audit" ? runNextJSSEOAudit(parsed) : command.id === "static-seo-audit" ? runStaticSEOAudit(parsed) : command.id === "build-seo-check" ? runBuildSEOCheck(parsed) : runFrameworkSEOAudit(parsed);
        return {
            active: true,
            type: "cms-framework-audit",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "audit-website" || command.id === "website-audit" || command.id === "full-audit" || command.id === "page-audit") {
        const parsed = parseWebsiteAuditInputFromText(input);
        const report = command.id === "page-audit" ? runPageAudit(parsed) : runWebsiteAudit(parsed);
        return {
            active: true,
            type: "website-audit",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "competitor-analysis" || command.id === "competitor-audit" || command.id === "competitor-keyword-gap" || command.id === "competitor-content-gap" || command.id === "competitor-backlink-gap" || command.id === "serp-analysis") {
        const parsed = parseCompetitorAnalysisInputFromText(input);
        const report = command.id === "competitor-keyword-gap" ? runCompetitorKeywordGap(parsed) : command.id === "competitor-content-gap" ? runCompetitorContentGap(parsed) : command.id === "competitor-backlink-gap" ? runCompetitorBacklinkGap(parsed) : command.id === "serp-analysis" ? runCompetitorSerpAnalysis(parsed) : runCompetitorAnalysis(parsed);
        return {
            active: true,
            type: "competitor-analysis",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "seo-plan" || command.id === "seo-strategy" || command.id === "seo-campaign-plan" || command.id === "opportunity-plan" || command.id === "launch-checklist" || command.id === "migration-plan") {
        const parsed = parseSEOStrategyInputFromText(input);
        const report = command.id === "seo-plan" ? runSEOPlan(parsed) : command.id === "seo-campaign-plan" ? runCampaignPlan(parsed) : command.id === "opportunity-plan" ? runOpportunityPlan(parsed) : command.id === "launch-checklist" ? runLaunchChecklist(parsed) : command.id === "migration-plan" ? runMigrationPlan(parsed) : runSEOStrategy(parsed);
        return {
            active: true,
            type: "seo-strategy",
            command,
            data: report,
            message: JSON.stringify(report, null, 2)
        };
    }
    if (command.id === "report" || command.id === "seo-report" || command.id === "measurement-report" || command.id === "governance-check" || command.id === "seo-qa" || command.id === "release-seo-check" || command.id === "final-status") {
        const parsed = parseReportingGovernanceInputFromText(input);
        const report = command.id === "measurement-report" ? runSEOMeasurement(parsed) : command.id === "governance-check" ? runSEOGovernance(parsed) : command.id === "seo-qa" ? runSEOQAChecklist(parsed) : command.id === "release-seo-check" ? runReleaseSEOGuard(parsed) : command.id === "final-status" ? runFinalMasterReport(parsed) : runSEOReport(parsed);
        return {
            active: true,
            type: "reporting-governance",
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
//# sourceMappingURL=orchestrator.js.map