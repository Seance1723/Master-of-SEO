import { join } from "node:path";
import { dataDir } from "./paths.js";
import { readJsonFile } from "./file-json.js";
let cache;
export async function getCommands() {
    cache ??= await readJsonFile(join(dataDir, "commands.json"));
    return cache;
}
export async function getCommandById(id) {
    const commands = await getCommands();
    return commands.find((command) => command.id === id);
}
export async function getCommandFromInput(commandName = "help") {
    const normalized = commandName.trim().replace(/^\/seo-master\s*/u, "").replace(/^\//u, "") || "help";
    return getCommandById(normalized);
}
export async function getCommandMenu() {
    const commands = await getCommands();
    const groups = [
        { title: "Core", ids: ["help", "memory", "final-status", "next-group"] },
        { title: "Audit", ids: ["audit-website", "website-audit", "full-audit", "page-audit", "technical-audit", "performance-audit", "on-page-audit", "schema-audit", "schema-generate", "media-audit", "image-seo-audit", "video-seo-audit", "accessibility-audit", "security-audit", "trust-audit", "eeat-audit"] },
        { title: "Research & Strategy", ids: ["keyword-research", "competitor-analysis", "competitor-audit", "competitor-keyword-gap", "competitor-content-gap", "competitor-backlink-gap", "serp-analysis", "content-plan", "architecture-audit", "internal-linking-audit", "seo-plan", "seo-strategy", "seo-campaign-plan", "opportunity-plan"] },
        { title: "Specialized SEO", ids: ["ecommerce-seo", "ecommerce-audit", "product-seo-audit", "category-seo-audit", "local-seo", "local-seo-audit", "international-seo", "international-seo-audit", "hreflang-audit", "ai-search-readiness", "ai-search-audit", "answer-block-audit", "discover-seo-audit", "ai-content-quality-audit", "framework-seo-audit", "wordpress-seo-audit", "react-seo-audit", "nextjs-seo-audit", "static-seo-audit", "build-seo-check"] },
        { title: "Launch, Migration & Reporting", ids: ["launch-checklist", "migration-plan", "report", "seo-report", "measurement-report", "governance-check", "seo-qa", "release-seo-check"] }
    ];
    const byId = new Map(commands.map((command) => [command.id, command]));
    const rendered = groups.map((group) => {
        const lines = group.ids.map((id) => byId.get(id)).filter((command) => Boolean(command)).map((command) => `${command.command} [${command.status}] - ${command.title}: ${command.description}`);
        return [`${group.title}:`, ...lines].join("\n");
    });
    const groupedIds = new Set(groups.flatMap((group) => group.ids));
    const uncategorized = commands.filter((command) => !groupedIds.has(command.id));
    if (uncategorized.length)
        rendered.push(["Other:", ...uncategorized.map((command) => `${command.command} [${command.status}] - ${command.title}: ${command.description}`)].join("\n"));
    return rendered.join("\n\n");
}
//# sourceMappingURL=command-registry.js.map