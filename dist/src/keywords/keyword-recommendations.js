export function buildKeywordRecommendations(issues, opportunities, missingInputs) {
    const actions = [];
    if (missingInputs.length)
        actions.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
    if (opportunities.some((item) => item.type === "bofu_gap"))
        actions.push("Prioritize BOFU keyword gaps with no mapped page.");
    if (opportunities.some((item) => item.type === "quick_win"))
        actions.push("Review quick wins from rankings or low difficulty inputs.");
    if (issues.some((issue) => issue.id.includes("cannibalization")))
        actions.push("Resolve cannibalization before creating duplicate pages.");
    actions.push("No live keyword volume, CPC, SERP, or difficulty data was fetched.");
    return actions;
}
//# sourceMappingURL=keyword-recommendations.js.map