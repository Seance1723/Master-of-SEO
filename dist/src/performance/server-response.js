export const serverResponseRules = [
    {
        id: "server-response-ttfb",
        category: "server-response",
        title: "Server response and TTFB",
        description: "Fast server response helps LCP and perceived speed.",
        do: ["Use CDN", "Use caching", "Optimize backend/database queries", "Compress responses", "Use HTTP/2 or HTTP/3 where available"],
        dont: ["Serve uncached static pages slowly", "Ignore slow hosting", "Let backend delays damage LCP"],
        priority: "P1",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkServerResponse(input) {
    const ttfb = input.metrics?.ttfb;
    if (ttfb === undefined)
        return { issues: [], passedChecks: [] };
    if (ttfb > 1800)
        return { issues: [issue("ttfb-slow", "TTFB is slow", "P1", `TTFB is ${ttfb}ms.`)], passedChecks: [] };
    if (ttfb > 800)
        return { issues: [issue("ttfb-needs-improvement", "TTFB needs improvement", "P2", `TTFB is ${ttfb}ms.`)], passedChecks: [] };
    return { issues: [], passedChecks: ["TTFB is within the good threshold."] };
}
function issue(id, title, priority, evidence) {
    return {
        id,
        category: "server-response",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Slow server response can delay the first byte and worsen LCP.",
        howToFix: "Use caching, CDN, compression, and backend/database optimization.",
        do: serverResponseRules[0].do,
        dont: serverResponseRules[0].dont,
        evidence: [evidence],
        appliesTo: ["website", "page", "performance", "audit"]
    };
}
//# sourceMappingURL=server-response.js.map