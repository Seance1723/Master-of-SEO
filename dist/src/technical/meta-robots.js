export const metaRobotsRules = [
    {
        id: "meta-robots-core",
        category: "meta robots",
        title: "Meta robots directives",
        description: "Meta robots should be intentional and visibility-safe.",
        do: ["Use noindex intentionally", "Keep desktop/mobile directives consistent", "Use max-image-preview:large where image visibility matters"],
        dont: ["Apply noindex globally by mistake", "Overuse nofollow internally", "Use nosnippet if visibility matters"],
        priority: "P1",
        appliesTo: ["page", "technical", "audit"],
        status: "active"
    }
];
export function checkMetaRobots(input) {
    const issues = [];
    const passedChecks = [];
    const directives = extractMetaRobots(input.html ?? "");
    const joined = directives.join(",").toLowerCase();
    const hasNoindex = /\bnoindex\b/u.test(joined);
    if (!input.html)
        return { issues, passedChecks, hasNoindex: false };
    if (hasNoindex)
        passedChecks.push("Meta robots noindex directive detected for indexability review.");
    if (/\bnofollow\b/u.test(joined)) {
        issues.push(issue("meta-robots-nofollow", "Nofollow directive found", "Provided HTML includes a meta robots nofollow directive.", "Internal nofollow can reduce discovery and signal flow.", "Use nofollow only when intentionally suppressing link following.", ["nofollow"]));
    }
    if (/\bnosnippet\b/u.test(joined)) {
        issues.push(issue("meta-robots-nosnippet", "Nosnippet directive found", "Provided HTML includes a nosnippet directive.", "Nosnippet can reduce search result visibility and click appeal.", "Remove nosnippet unless snippets must be suppressed.", ["nosnippet"]));
    }
    if (/\bmax-image-preview\s*:\s*large\b/u.test(joined)) {
        passedChecks.push("max-image-preview:large is present.");
    }
    else {
        issues.push(issue("meta-robots-missing-max-image-preview", "max-image-preview:large not found", "Provided HTML does not include max-image-preview:large.", "Large image previews can improve visibility for image-rich pages.", "Add max-image-preview:large when image visibility matters.", ["No max-image-preview:large directive found"], "P3"));
    }
    return { issues, passedChecks, hasNoindex };
}
function extractMetaRobots(html) {
    return [...html.matchAll(/<meta\b(?=[^>]*name\s*=\s*["'](?:robots|googlebot)["'])(?=[^>]*content\s*=\s*["']([^"']+)["'])[^>]*>/giu)].map((match) => match[1]);
}
function issue(id, title, problem, whyItMatters, howToFix, evidence, priority = "P2") {
    return {
        id,
        category: "meta robots",
        title,
        priority,
        problem,
        whyItMatters,
        howToFix,
        do: metaRobotsRules[0].do,
        dont: metaRobotsRules[0].dont,
        evidence,
        appliesTo: ["page", "technical", "audit"]
    };
}
//# sourceMappingURL=meta-robots.js.map