export const performanceOptimizationRules = [
    {
        id: "performance-optimization-core",
        category: "performance-optimization",
        title: "Performance optimization",
        description: "Prioritize optimizations that improve real user experience and SEO-critical rendering.",
        do: ["Prioritize mobile field data", "Fix P0/P1 Core Web Vitals first", "Optimize above-fold rendering before polish"],
        dont: ["Treat lab-only gains as final proof", "Optimize non-critical assets before critical rendering", "Ignore business-critical templates"],
        priority: "P1",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
//# sourceMappingURL=performance-optimization.js.map