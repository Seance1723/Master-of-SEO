export const aboveTheFoldRules = [{
        id: "above-fold-core",
        category: "above-the-fold",
        title: "Above-the-fold clarity",
        description: "Important pages should make the topic, value, and next action clear immediately.",
        do: ["Clearly state the page value above the fold", "Make the primary CTA visible where relevant", "Show trust signals on commercial pages", "Keep the hero section fast and focused"],
        dont: ["Use huge empty hero sections", "Hide the main topic below decorative content", "Use vague hero headlines", "Push important content too far down"],
        priority: "P2",
        appliesTo: ["website", "page", "content", "on_page", "audit"],
        status: "active"
    }];
export function checkAboveTheFold(input) {
    const hasValue = Boolean((input.h1 && !/^(welcome|home)$/iu.test(input.h1)) || input.title || input.bodyText?.slice(0, 250).trim());
    if (isCommercial(input) && !hasValue) {
        return {
            issues: [{
                    id: "above-fold-value-missing",
                    category: "above-the-fold",
                    title: "Above-the-fold value is unclear",
                    priority: "P2",
                    problem: "No clear title, H1, or early value copy was provided.",
                    whyItMatters: "Users and search systems need the page purpose quickly.",
                    howToFix: "State the page value and topic clearly near the top.",
                    do: aboveTheFoldRules[0].do,
                    dont: aboveTheFoldRules[0].dont,
                    evidence: ["No clear above-fold value signal found in provided input"],
                    appliesTo: ["page", "content", "on_page", "audit"]
                }],
            passedChecks: []
        };
    }
    return { issues: [], passedChecks: hasValue ? ["Above-the-fold clarity signal found."] : [] };
}
function isCommercial(input) {
    return ["homepage", "service", "product", "landing", "pricing"].includes(input.pageType ?? "");
}
//# sourceMappingURL=above-the-fold.js.map