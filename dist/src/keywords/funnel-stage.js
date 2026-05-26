export function mapFunnelStage(intent) {
    if (intent === "informational")
        return "tofu";
    if (intent === "commercial" || intent === "comparison" || intent === "product_led")
        return "mofu";
    if (intent === "transactional" || intent === "pricing" || intent === "local")
        return "bofu";
    if (intent === "support" || intent === "navigational")
        return "retention";
    return "unknown";
}
//# sourceMappingURL=funnel-stage.js.map