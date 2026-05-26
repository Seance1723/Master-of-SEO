export const imageAltRules = [{
        id: "image-alt-core",
        category: "image-alt",
        title: "Image alt text",
        description: "Important images should have meaningful, natural alt text.",
        do: ["Add meaningful alt text", "Keep alt text natural", "Describe the image purpose", "Leave decorative images empty where appropriate"],
        dont: ["Keyword-stuff alt text", "Use the same alt text for all images", "Leave important images without alt text", "Put important page copy only inside images"],
        priority: "P2",
        appliesTo: ["website", "page", "content", "on_page", "audit"],
        status: "active"
    }];
export function checkImageAlt(input) {
    const images = input.images ?? [];
    const issues = [];
    for (const image of images) {
        if (image.alt === undefined)
            issues.push(issue("image-alt-missing", "Image missing alt text", image.position === "above_fold" ? "P2" : "P3", image.src, "Add meaningful alt text or an empty alt for decorative images."));
        else if (isStuffed(image.alt))
            issues.push(issue("image-alt-keyword-stuffed", "Image alt may be keyword-stuffed", "P2", image.alt, "Rewrite alt text naturally."));
    }
    const duplicate = images.map((image) => image.alt?.trim().toLowerCase()).filter(Boolean).find((alt, _, arr) => arr.filter((item) => item === alt).length >= 3);
    if (duplicate)
        issues.push(issue("image-alt-duplicate-many", "Duplicate alt text across many images", "P3", duplicate, "Make alt text specific to each meaningful image."));
    return { issues, passedChecks: images.length && !issues.length ? ["Image alt checks passed."] : [] };
}
function isStuffed(text) {
    const words = text.toLowerCase().split(/\W+/u).filter((word) => word.length > 3);
    return words.some((word) => words.filter((item) => item === word).length >= 3);
}
function issue(id, title, priority, evidence, howToFix) {
    return {
        id,
        category: "image-alt",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Alt text supports accessibility and image understanding.",
        howToFix,
        do: imageAltRules[0].do,
        dont: imageAltRules[0].dont,
        evidence: [evidence],
        appliesTo: ["page", "content", "on_page", "audit"]
    };
}
//# sourceMappingURL=image-alt.js.map