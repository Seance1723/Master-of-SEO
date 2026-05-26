export function getQuickWins(issues) {
    return issues.filter((issue) => ["P1", "P2"].includes(issue.priority) && /missing title|missing meta|missing h1|internal link|large image|missing schema|missing cta|thin/i.test(`${issue.id} ${issue.title}`)).slice(0, 10).map((issue) => issue.title);
}
export function getStrategicOpportunities(issues) {
    const opportunities = issues.filter((issue) => /content|cluster|bofu|template|ecommerce|local|international|answer|trust|eeat/i.test(`${issue.category} ${issue.title}`)).slice(0, 10).map((issue) => issue.title);
    return opportunities.length ? opportunities : ["Use provided audit inputs to prioritize strategic SEO opportunities."];
}
//# sourceMappingURL=audit-report-generator.js.map