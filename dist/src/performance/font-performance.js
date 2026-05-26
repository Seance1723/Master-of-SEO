export const fontPerformanceRules = [
    {
        id: "font-performance-core",
        category: "font-performance",
        title: "Font performance",
        description: "Fonts should be limited, preloaded carefully, and configured to avoid rendering delays and layout shifts.",
        do: ["Preload critical fonts", "Use font-display strategy", "Limit font families and weights", "Use system fonts when suitable"],
        dont: ["Load unnecessary font weights", "Block rendering with too many font files", "Cause CLS through late font swaps"],
        priority: "P2",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkFontPerformance(input) {
    const issues = [];
    const fonts = (input.assets ?? []).filter((asset) => asset.type === "font");
    if (fonts.length > 4)
        issues.push(issue("font-too-many-files", "Many font files", "P2", `${fonts.length} font files provided.`));
    const fontWeights = new Set(fonts.map((font) => font.url.match(/(?:-|_)([1-9]00)(?:\.|-|_)/u)?.[1]).filter(Boolean));
    if (fontWeights.size > 4)
        issues.push(issue("font-too-many-weights", "Many font weights", "P3", `${fontWeights.size} font weights inferred from asset names.`));
    const hasFontAsset = fonts.length > 0 || /font-family|\.woff2?|fonts\.googleapis/iu.test(input.html ?? "");
    const hasPreload = /rel\s*=\s*["']preload["'][^>]+as\s*=\s*["']font["']/iu.test(input.html ?? "");
    if (hasFontAsset && input.html && !hasPreload)
        issues.push(issue("font-missing-preload", "Critical font preload not found", "P3", "Font usage detected without a font preload hint."));
    return { issues, passedChecks: fonts.length && !issues.length ? ["Font checks passed."] : [] };
}
function issue(id, title, priority, evidence) {
    return {
        id,
        category: "font-performance",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Fonts can block rendering and cause layout shifts.",
        howToFix: "Limit font files and weights, use font-display, and preload only critical fonts.",
        do: fontPerformanceRules[0].do,
        dont: fontPerformanceRules[0].dont,
        evidence: [evidence],
        appliesTo: ["website", "page", "performance", "audit"]
    };
}
//# sourceMappingURL=font-performance.js.map