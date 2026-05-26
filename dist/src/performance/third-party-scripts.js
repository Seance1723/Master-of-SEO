export const thirdPartyScriptRules = [
    {
        id: "third-party-scripts-core",
        category: "third-party-scripts",
        title: "Third-party script performance",
        description: "Third-party scripts should be owned, audited, delayed, and deduplicated.",
        do: ["Audit third-party scripts", "Delay chat, heatmap, and marketing widgets where possible", "Remove unused tracking pixels", "Load critical analytics responsibly"],
        dont: ["Allow third-party scripts to destroy INP", "Load duplicate analytics", "Install scripts without performance ownership"],
        priority: "P2",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkThirdPartyScripts(input) {
    const thirdPartyAssets = (input.assets ?? []).filter((asset) => asset.type === "third_party");
    const htmlMatches = [...(input.html ?? "").matchAll(/<script\b[^>]+src\s*=\s*["']https?:\/\/([^/"']+)/giu)].map((match) => match[1]);
    const issues = [];
    if (thirdPartyAssets.length > 3 || htmlMatches.length > 6) {
        issues.push({
            id: "third-party-many-scripts",
            category: "third-party-scripts",
            title: "Many third-party scripts",
            priority: "P2",
            problem: `${thirdPartyAssets.length || htmlMatches.length} third-party script signals found.`,
            whyItMatters: "Third-party scripts can delay rendering, increase main-thread work, and harm INP.",
            howToFix: "Audit ownership, remove unused tags, and delay non-critical widgets.",
            do: thirdPartyScriptRules[0].do,
            dont: thirdPartyScriptRules[0].dont,
            evidence: [...thirdPartyAssets.map((asset) => asset.url), ...htmlMatches].slice(0, 8),
            appliesTo: ["website", "page", "performance", "audit"]
        });
    }
    return { issues, passedChecks: thirdPartyAssets.length || htmlMatches.length ? ["Third-party scripts reviewed."] : [] };
}
//# sourceMappingURL=third-party-scripts.js.map