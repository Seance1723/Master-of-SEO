export const imagePerformanceRules = [
    {
        id: "image-performance-core",
        category: "image-performance",
        title: "Image performance",
        description: "Images should be compressed, modern, responsive, dimensioned, and loaded by viewport priority.",
        do: ["Use WebP/AVIF where possible", "Compress images", "Use responsive images and srcset", "Set width and height", "Lazy-load below-fold images"],
        dont: ["Upload huge raw images", "Lazy-load above-fold hero images", "Use image text as important SEO content"],
        priority: "P1",
        appliesTo: ["website", "page", "performance", "audit"],
        status: "active"
    }
];
export function checkImagePerformance(input) {
    const issues = [];
    const imageAssets = (input.assets ?? []).filter((asset) => asset.type === "image");
    for (const asset of imageAssets) {
        if ((asset.sizeKb ?? 0) > 1000)
            issues.push(issue("image-very-large", "Very large image asset", "P1", asset, `Image is ${asset.sizeKb}KB.`));
        else if ((asset.sizeKb ?? 0) > 300)
            issues.push(issue("image-large", "Large image asset", "P2", asset, `Image is ${asset.sizeKb}KB.`));
        if (!asset.width || !asset.height)
            issues.push(issue("image-missing-dimensions", "Image missing width/height", "P2", asset, "Image asset lacks width or height."));
        if (asset.position === "above_fold" && asset.loading === "lazy")
            issues.push(issue("hero-image-lazy-loaded", "Above-fold hero image is lazy-loaded", "P1", asset, "Above-fold image uses lazy loading."));
        if (asset.format && !["webp", "avif", "svg"].includes(asset.format.toLowerCase()))
            issues.push(issue("image-non-modern-format", "Non-modern image format", "P2", asset, `Image format is ${asset.format}.`));
    }
    return { issues, passedChecks: imageAssets.length && !issues.length ? ["Image asset checks passed."] : [] };
}
function issue(id, title, priority, asset, evidence) {
    return {
        id,
        category: "image-performance",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Images often drive LCP, page weight, and layout stability.",
        howToFix: "Compress images, use modern formats, set dimensions, and load by viewport priority.",
        do: imagePerformanceRules[0].do,
        dont: imagePerformanceRules[0].dont,
        evidence: [asset.url, evidence],
        appliesTo: ["website", "page", "performance", "audit"]
    };
}
//# sourceMappingURL=image-performance.js.map