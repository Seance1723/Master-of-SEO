export const headingRules = [{
        id: "heading-structure-core",
        category: "headings",
        title: "Heading structure",
        description: "Headings should organize the page with one clear H1 and descriptive subtopics.",
        do: ["Use one clear H1", "Use H2/H3 to structure the page", "Make headings descriptive", "Use headings to support scanability", "Include subtopics users expect"],
        dont: ["Skip heading hierarchy carelessly", "Use headings only for styling", "Repeat the same keyword in every heading", "Use multiple unrelated H1s", "Hide important sections without headings"],
        priority: "P1",
        appliesTo: ["website", "page", "content", "on_page", "audit"],
        status: "active"
    }];
export function checkHeadings(input) {
    const headings = input.headings ?? [];
    const h1s = headings.filter((heading) => heading.level === "h1");
    const issues = [];
    if (!input.h1 && h1s.length === 0)
        issues.push(issue("h1-missing", "Missing H1", "P1", "No H1 was provided or extracted.", "Add one clear H1 describing the page."));
    if (h1s.length > 1)
        issues.push(issue("h1-multiple", "Multiple H1s found", "P2", `${h1s.length} H1 headings found.`, "Use one primary H1 and structure subtopics with H2/H3."));
    if (h1s.some((heading) => !heading.text.trim()) || input.h1?.trim() === "")
        issues.push(issue("h1-empty", "Empty H1", "P1", "H1 is empty.", "Write a descriptive H1."));
    const h1Text = input.h1 ?? h1s[0]?.text ?? "";
    if (/^(welcome|home)$/iu.test(h1Text.trim()))
        issues.push(issue("h1-vague", "H1 is too vague", "P2", h1Text, "Make the H1 specific to the page topic."));
    if (isContentHeavy(input) && !headings.some((heading) => heading.level === "h2"))
        issues.push(issue("h2-missing-content-heavy", "Missing H2s on content-heavy page", "P2", "No H2 headings found.", "Use H2s to organize important sections."));
    for (let index = 1; index < headings.length; index++) {
        const prev = Number(headings[index - 1].level.slice(1));
        const current = Number(headings[index].level.slice(1));
        if (current - prev > 1)
            issues.push(issue("heading-skipped-hierarchy", "Skipped heading hierarchy", "P3", `${headings[index - 1].level} to ${headings[index].level}`, "Avoid large jumps in heading hierarchy."));
    }
    const repeated = headings.map((heading) => heading.text.trim().toLowerCase()).filter(Boolean).find((text, _, arr) => arr.filter((item) => item === text).length > 1);
    if (repeated)
        issues.push(issue("heading-repeated-text", "Repeated heading text", "P3", repeated, "Make repeated headings more specific."));
    const long = headings.find((heading) => heading.text.length > 90);
    if (long)
        issues.push(issue("heading-too-long", "Very long heading", "P3", long.text, "Shorten headings for scanability."));
    return { issues, passedChecks: headings.length && !issues.length ? ["Heading checks passed."] : [] };
}
function isContentHeavy(input) {
    return (input.bodyText?.split(/\s+/u).filter(Boolean).length ?? 0) > 300 || input.pageType === "blog" || input.pageType === "documentation";
}
function issue(id, title, priority, evidence, howToFix) {
    return {
        id,
        category: "headings",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Headings clarify topic hierarchy for users and search systems.",
        howToFix,
        do: headingRules[0].do,
        dont: headingRules[0].dont,
        evidence: [evidence],
        appliesTo: ["page", "content", "on_page", "audit"]
    };
}
//# sourceMappingURL=headings.js.map