const patterns = [
    ["transactional", /\b(buy|quote|hire|agency|service|consultant|demo|book)\b/iu],
    ["pricing", /\b(pricing|cost|price|plans)\b/iu],
    ["comparison", /\b(vs|versus|alternative|alternatives|compare)\b/iu],
    ["commercial", /\b(best|top|review|reviews|software|tool|solution)\b/iu],
    ["product_led", /\b(product|platform|app|software|tool|features)\b/iu],
    ["support", /\b(login|setup|documentation|docs|help|troubleshooting|fix|error)\b/iu],
    ["informational", /\b(what|how|why|guide|tutorial|checklist|meaning|examples|tips)\b/iu]
];
export function detectKeywordIntent(keyword, business) {
    const value = keyword.toLowerCase();
    const hasBusinessName = business?.name && value.includes(business.name.toLowerCase());
    const strongBofu = /\b(buy|quote|hire|service|consultant|demo|book|pricing|cost|price|plans|near me)\b/iu.test(value);
    if (/\bnear me|local\b/iu.test(value) || (business?.locations ?? []).some((location) => value.includes(` in ${location.toLowerCase()}`) || value.includes(location.toLowerCase())))
        return "local";
    for (const [intent, pattern] of patterns)
        if (pattern.test(value))
            return intent;
    if (hasBusinessName && !strongBofu)
        return "navigational";
    return "unknown";
}
//# sourceMappingURL=search-intent.js.map