export const coreWebVitalsRules = [
    {
        id: "core-web-vitals-core",
        category: "core-web-vitals",
        title: "Core Web Vitals baseline",
        description: "LCP, INP, and CLS should meet user-centric performance thresholds.",
        do: ["Keep LCP <= 2.5s", "Keep INP <= 200ms", "Keep CLS <= 0.1", "Optimize mobile performance first", "Check real-user data when available"],
        dont: ["Optimize only Lighthouse lab scores", "Ignore poor mobile field data", "Treat homepage score as whole-site score"],
        priority: "P1",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkCoreWebVitals(input) {
    const issues = [];
    const passedChecks = [];
    const metrics = input.metrics ?? {};
    if (metrics.lcp !== undefined) {
        if (metrics.lcp > 4)
            issues.push(issue("cwv-lcp-critical", "LCP is critically slow", "P0", `LCP is ${metrics.lcp}s.`, "Optimize hero assets, server response, and render-blocking resources."));
        else if (metrics.lcp > 2.5)
            issues.push(issue("cwv-lcp-needs-improvement", "LCP needs improvement", "P1", `LCP is ${metrics.lcp}s.`, "Optimize the largest above-fold content element."));
        else
            passedChecks.push("LCP is within the good threshold.");
    }
    if (metrics.inp !== undefined) {
        if (metrics.inp > 500)
            issues.push(issue("cwv-inp-critical", "INP is critically slow", "P0", `INP is ${metrics.inp}ms.`, "Reduce JavaScript work, split long tasks, and defer non-critical scripts."));
        else if (metrics.inp > 200)
            issues.push(issue("cwv-inp-needs-improvement", "INP needs improvement", "P1", `INP is ${metrics.inp}ms.`, "Reduce main-thread blocking and third-party script impact."));
        else
            passedChecks.push("INP is within the good threshold.");
    }
    if (metrics.cls !== undefined) {
        if (metrics.cls > 0.25)
            issues.push(issue("cwv-cls-critical", "CLS is critically high", "P0", `CLS is ${metrics.cls}.`, "Reserve layout space for images, embeds, banners, ads, and font swaps."));
        else if (metrics.cls > 0.1)
            issues.push(issue("cwv-cls-needs-improvement", "CLS needs improvement", "P1", `CLS is ${metrics.cls}.`, "Define dimensions and reserve space for dynamic content."));
        else
            passedChecks.push("CLS is within the good threshold.");
    }
    return { issues, passedChecks };
}
function issue(id, title, priority, evidence, howToFix) {
    return {
        id,
        category: "core-web-vitals",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Core Web Vitals affect user experience and can influence search performance.",
        howToFix,
        do: coreWebVitalsRules[0].do,
        dont: coreWebVitalsRules[0].dont,
        evidence: [evidence],
        appliesTo: ["website", "page", "performance", "audit"]
    };
}
//# sourceMappingURL=core-web-vitals.js.map