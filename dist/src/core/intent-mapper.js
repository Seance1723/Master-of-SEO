const signals = {
    "Informational": ["how", "what", "why", "guide", "learn"],
    "Commercial": ["best", "top", "review", "features"],
    "Transactional": ["buy", "order", "discount", "coupon"],
    "Navigational": ["login", "brand", "homepage"],
    "Local": ["near me", "city", "directions", "local"],
    "Comparison": ["vs", "versus", "alternative", "compare"],
    "Pricing": ["pricing", "price", "cost", "plans"],
    "Product-led": ["product", "demo", "trial", "use case"],
    "Support": ["help", "support", "troubleshoot", "documentation"]
};
export function mapIntent(input) {
    const haystack = input.toLowerCase();
    let best = { type: "Unknown", confidence: 0, matchedSignals: [] };
    for (const [type, keywords] of Object.entries(signals)) {
        const matchedSignals = keywords.filter((keyword) => haystack.includes(keyword));
        if (matchedSignals.length > best.matchedSignals.length)
            best = { type: type, confidence: Math.min(0.95, 0.45 + matchedSignals.length * 0.15), matchedSignals };
    }
    return best;
}
//# sourceMappingURL=intent-mapper.js.map