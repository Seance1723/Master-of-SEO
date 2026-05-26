export const cssPerformanceRules = [
    {
        id: "css-performance-core",
        category: "css-performance",
        title: "CSS performance",
        description: "CSS should prioritize critical rendering and avoid large unused global styles.",
        do: ["Inline or prioritize critical CSS", "Remove unused CSS", "Minify CSS", "Avoid massive global CSS"],
        dont: ["Block rendering with unnecessary CSS", "Ship unused framework styles everywhere", "Use heavy animation CSS without need"],
        priority: "P2",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkCssPerformance(input) {
    const issues = [];
    const stylesheets = (input.assets ?? []).filter((asset) => asset.type === "stylesheet");
    for (const asset of stylesheets) {
        if ((asset.sizeKb ?? 0) > 200) {
            issues.push({
                id: "css-large",
                category: "css-performance",
                title: "Large CSS asset",
                priority: "P2",
                problem: `Stylesheet is ${asset.sizeKb}KB.`,
                whyItMatters: "Large CSS can block rendering and delay first paint.",
                howToFix: "Remove unused CSS, split critical styles, and minify.",
                do: cssPerformanceRules[0].do,
                dont: cssPerformanceRules[0].dont,
                evidence: [asset.url, `${asset.sizeKb}KB`],
                appliesTo: ["website", "page", "performance", "audit"]
            });
        }
    }
    const htmlStylesheets = (input.html?.match(/<link\b[^>]*rel\s*=\s*["']stylesheet["']/giu) ?? []).length;
    if (htmlStylesheets > 5) {
        issues.push({
            id: "css-too-many-stylesheets",
            category: "css-performance",
            title: "Too many stylesheets",
            priority: "P2",
            problem: `${htmlStylesheets} stylesheet tags found.`,
            whyItMatters: "Many stylesheets can increase render-blocking requests.",
            howToFix: "Consolidate, remove unused styles, and prioritize critical CSS.",
            do: cssPerformanceRules[0].do,
            dont: cssPerformanceRules[0].dont,
            evidence: [`${htmlStylesheets} stylesheet tags found`],
            appliesTo: ["page", "performance", "audit"]
        });
    }
    return { issues, passedChecks: stylesheets.length && !issues.length ? ["CSS asset checks passed."] : [] };
}
//# sourceMappingURL=css-performance.js.map