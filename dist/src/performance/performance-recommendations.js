export function buildPerformanceRecommendations(issues, missingInputs) {
    const actions = [];
    if (missingInputs.length)
        actions.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
    if (issues.some((issue) => issue.priority === "P0"))
        actions.push("Fix P0 Core Web Vitals or severe performance blockers first.");
    if (issues.some((issue) => issue.priority === "P1"))
        actions.push("Address P1 LCP, INP, CLS, TTFB, and large critical asset issues next.");
    actions.push("No live Lighthouse crawl was performed; results are limited to supplied metrics, HTML, headers, and asset data.");
    return actions;
}
//# sourceMappingURL=performance-recommendations.js.map