export const auditCategoryWeights = {
    technicalSeo: 15,
    performanceSeo: 10,
    onPageSeo: 10,
    contentSeo: 10,
    architectureInternalLinking: 10,
    schemaEntitySeo: 7,
    mediaSeo: 5,
    ecommerceSeo: 7,
    localInternationalSeo: 6,
    aiSearchDiscoverSeo: 5,
    trustSecurityAccessibility: 10,
    cmsFrameworkSeo: 5
};
export function scoreFromIssues(issues) {
    return Math.max(0, 100 - issues.reduce((sum, issue) => sum + ({ P0: 20, P1: 8, P2: 3, P3: 1 }[issue.priority]), 0));
}
export function calculateCategoryScore(issues, sourceSkill) {
    return scoreFromIssues(issues.filter((issue) => issue.sourceSkill === sourceSkill || issue.sourceSkills?.includes(sourceSkill)));
}
export function calculateWebsiteScore(categoryScores) {
    const applicable = Object.entries(categoryScores).filter((entry) => typeof entry[1] === "number");
    const totalWeight = applicable.reduce((sum, [key]) => sum + auditCategoryWeights[key], 0);
    if (!totalWeight)
        return 0;
    return Math.round(applicable.reduce((sum, [key, value]) => sum + value * auditCategoryWeights[key], 0) / totalWeight);
}
export function gradeFromScore(score) {
    if (score >= 90)
        return "A";
    if (score >= 75)
        return "B";
    if (score >= 60)
        return "C";
    if (score >= 40)
        return "D";
    return "F";
}
//# sourceMappingURL=website-score.js.map