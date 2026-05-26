export function checkAnchorText(input) {
    const issues = [];
    const anchorsByTarget = new Map();
    for (const link of input.links ?? []) {
        const text = link.anchorText?.trim() ?? "";
        anchorsByTarget.set(link.to, [...(anchorsByTarget.get(link.to) ?? []), text.toLowerCase()]);
        if (!text)
            issues.push(issue("anchor-empty", "Empty anchor text", "P3", link.to));
        if (/^(click here|read more|more|link|here)$/iu.test(text))
            issues.push(issue("anchor-generic", "Generic anchor text", "P3", text));
        if (/^javascript:/iu.test(link.to))
            issues.push(issue("internal-javascript-link", "JavaScript internal link", "P2", link.to));
    }
    for (const [to, anchors] of anchorsByTarget.entries()) {
        const repeated = anchors.find((anchor) => anchor && anchors.filter((item) => item === anchor).length > 5);
        if (repeated)
            issues.push(issue("anchor-exact-match-overuse", "Repeated exact-match anchor", "P3", `${repeated} -> ${to}`));
    }
    return issues;
}
function issue(id, title, priority, evidence) {
    return { id, category: "anchor-text", title, priority, problem: evidence, whyItMatters: "Anchor text helps users and search systems understand destination pages.", howToFix: "Use natural, descriptive anchor text that makes destination clear.", do: ["Make anchor text descriptive", "Keep anchor text natural", "Vary anchor text where appropriate"], dont: ["Stuff keywords", "Use vague anchors repeatedly", "Mislead users about destination page"], evidence: [evidence], appliesTo: ["internal_linking", "planning", "audit"] };
}
//# sourceMappingURL=anchor-text.js.map