export const assetOptimizationRules = [
    {
        id: "asset-optimization-core",
        category: "asset-optimization",
        title: "Asset optimization",
        description: "Assets should be compressed, cacheable, appropriately loaded, and limited to what the page needs.",
        do: ["Compress assets", "Cache static files", "Load critical assets early", "Defer non-critical assets"],
        dont: ["Ship unused assets", "Load heavy above-fold assets without need", "Ignore cache and compression headers"],
        priority: "P2",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkAssetOptimization(input) {
    const assets = input.assets ?? [];
    const totalKb = assets.reduce((sum, asset) => sum + (asset.sizeKb ?? 0), 0);
    const issues = [];
    if (totalKb > 3000) {
        issues.push({
            id: "asset-total-weight-high",
            category: "asset-optimization",
            title: "High total asset weight",
            priority: "P2",
            problem: `Provided assets total ${totalKb}KB.`,
            whyItMatters: "High page weight can slow loading and worsen Core Web Vitals.",
            howToFix: "Compress, remove, lazy-load, and defer non-critical assets.",
            do: assetOptimizationRules[0].do,
            dont: assetOptimizationRules[0].dont,
            evidence: [`totalAssetKb=${totalKb}`],
            appliesTo: ["website", "page", "performance", "audit"]
        });
    }
    return { issues, passedChecks: assets.length && !issues.length ? ["Total provided asset weight is within baseline threshold."] : [] };
}
//# sourceMappingURL=asset-optimization.js.map