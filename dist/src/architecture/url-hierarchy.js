export function checkUrlHierarchy(input) {
    return (input.pages ?? []).flatMap((page) => {
        const depth = page.url.split("?")[0].split("/").filter(Boolean).length;
        if (depth > 5)
            return [{ id: "url-hierarchy-too-deep", category: "url-hierarchy", title: "URL path is deeply nested", priority: "P3", problem: page.url, whyItMatters: "Very deep paths can signal confusing hierarchy.", howToFix: "Keep URL hierarchy logical and avoid unnecessary path depth.", do: ["Keep URL hierarchy logical", "Use category/subcategory structure where useful", "Keep URLs readable"], dont: ["Create unnecessary deep URL paths", "Mix unrelated sections"], evidence: [page.url], appliesTo: ["architecture", "planning", "audit"] }];
        return [];
    });
}
//# sourceMappingURL=url-hierarchy.js.map