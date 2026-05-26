const doRules = ["Require original insight", "Require examples, proof, screenshots, data, or expert input where possible", "Check user value", "Align with E-E-A-T"];
const dontRules = ["Publish commodity content", "Copy competitors", "Create mass low-value pages", "Overpromise ranking impact"];
export function qualityGuard(input, items) {
    const issues = [];
    if (!input.business?.goals?.length)
        issues.push(issue("content-no-business-goal", "No business goal provided", "P2", "Business goals were not provided.", "Add business goals before final prioritization."));
    if (!input.keywordClusters?.length)
        issues.push(issue("content-no-keyword-clusters", "No keyword clusters provided", "P1", "Keyword clusters were not provided.", "Use Group 5 keyword clusters or provide manual clusters."));
    const tofu = items.filter((item) => item.funnelStage === "tofu").length;
    const bofu = items.filter((item) => item.funnelStage === "bofu").length;
    if (tofu > 2 && bofu === 0)
        issues.push(issue("content-too-much-tofu", "Too many TOFU items without BOFU", "P2", `${tofu} TOFU items and 0 BOFU items.`, "Add conversion-stage content before more TOFU blogs."));
    for (const item of items) {
        if (["commercial", "transactional", "pricing", "product_led", "local"].includes(item.intent) && !item.ctaRecommendation)
            issues.push(issue("content-commercial-missing-cta", "Commercial content missing CTA", "P2", item.title, "Add a CTA matching page intent."));
        if (!item.internalLinksToAdd.length)
            issues.push(issue("content-missing-internal-links", "Content item missing internal link plan", "P2", item.title, "Add pillar/supporting/commercial internal links."));
        if (!item.qualityNotes.length)
            issues.push(issue("content-generic-brief", "Brief lacks original value requirement", "P2", item.title, "Add information-gain and E-E-A-T requirements."));
    }
    return issues;
}
function issue(id, title, priority, evidence, howToFix) {
    return { id, category: "content-quality", title, priority, problem: evidence, whyItMatters: "Content plans need business purpose, originality, and useful linking to avoid low-value output.", howToFix, do: doRules, dont: dontRules, evidence: [evidence], appliesTo: ["content", "planning", "strategy", "audit"] };
}
//# sourceMappingURL=content-quality-guard.js.map