export function serpIntentAssumptionIssue(hasSerpData) {
    if (hasSerpData)
        return [];
    return [{
            id: "serp-intent-not-verified",
            category: "serp-intent-guard",
            title: "SERP intent not verified",
            priority: "P3",
            problem: "No live SERP data was provided.",
            whyItMatters: "Rule-based intent is useful but should be validated against real SERPs before publishing page plans.",
            howToFix: "Verify top-ranking pages manually or through a future SERP provider integration.",
            do: ["Flag uncertain intent as unknown", "Validate SERP intent before final page decisions"],
            dont: ["Assume intent only from keyword volume", "Claim SERP patterns without evidence"],
            evidence: ["No SERP input present"],
            appliesTo: ["keyword", "planning", "audit"]
        }];
}
//# sourceMappingURL=serp-intent-guard.js.map