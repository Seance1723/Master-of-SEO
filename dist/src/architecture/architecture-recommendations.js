export function buildArchitectureRecommendations(input, issues, missingInputs) {
    const recommendations = [];
    if (missingInputs.length)
        recommendations.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
    if (issues.some((issue) => issue.id.includes("orphan")))
        recommendations.push("Add contextual links to valuable orphan pages or prune low-value orphan pages.");
    if (issues.some((issue) => issue.category === "crawl-depth"))
        recommendations.push("Add internal links from homepage, hub, or navigation pages to reduce depth for important URLs.");
    if (input.topicClusters?.length)
        recommendations.push("Review topic cluster links between pillar, supporting, and commercial pages.");
    recommendations.push("No live crawling was performed; findings use only supplied page, link, navigation, breadcrumb, sitemap, and topic cluster inputs.");
    return recommendations;
}
//# sourceMappingURL=architecture-recommendations.js.map