const signals = {
    "Lead generation": ["lead", "inquiry", "quote", "form"],
    "Sales": ["sales", "revenue", "purchase", "checkout"],
    "Demo booking": ["demo", "book a call", "schedule"],
    "Signup": ["signup", "sign up", "register", "trial"],
    "Brand awareness": ["brand", "awareness", "visibility"],
    "Content traffic": ["traffic", "blog", "readers", "newsletter"],
    "Local visits": ["local", "visit", "directions", "near me"],
    "Support/self-service": ["support", "help center", "self-service", "docs"]
};
export function detectBusinessGoal(input) {
    const haystack = input.toLowerCase();
    let best = { type: "Unknown", confidence: 0, matchedSignals: [] };
    for (const [type, keywords] of Object.entries(signals)) {
        const matchedSignals = keywords.filter((keyword) => haystack.includes(keyword));
        if (matchedSignals.length > best.matchedSignals.length)
            best = { type: type, confidence: Math.min(0.95, 0.45 + matchedSignals.length * 0.15), matchedSignals };
    }
    return best;
}
//# sourceMappingURL=business-goal-detector.js.map