export function recommendSchemaTypes(input) {
    const pageType = input.page?.pageType ?? "unknown";
    const recommended = new Set();
    if (pageType === "homepage")
        add(recommended, "Organization", "WebSite");
    if (["blog", "article"].includes(pageType))
        add(recommended, "BlogPosting", "BreadcrumbList");
    if (pageType === "service")
        add(recommended, "Service", "Organization", "BreadcrumbList");
    if (pageType === "product")
        add(recommended, "Product", "BreadcrumbList");
    if (["landing", "pricing"].includes(pageType) && input.softwareApplication)
        add(recommended, "SoftwareApplication", "Organization");
    if (pageType === "local")
        add(recommended, "LocalBusiness", "BreadcrumbList");
    if (pageType === "video")
        add(recommended, "VideoObject");
    if (pageType === "job")
        add(recommended, "JobPosting");
    if (pageType === "category")
        add(recommended, "BreadcrumbList", "ItemList");
    if (pageType === "documentation")
        add(recommended, "TechArticle", "BreadcrumbList");
    if (input.organization)
        recommended.add("Organization");
    if (input.page?.url || input.url)
        recommended.add("WebSite");
    if (input.page?.breadcrumbs?.length)
        recommended.add("BreadcrumbList");
    if (input.product)
        recommended.add("Product");
    if (input.service)
        recommended.add("Service");
    if (input.softwareApplication)
        recommended.add("SoftwareApplication");
    if (input.localBusiness)
        recommended.add("LocalBusiness");
    if (input.video)
        recommended.add("VideoObject");
    if (input.jobPosting)
        recommended.add("JobPosting");
    return [...recommended];
}
function add(set, ...items) {
    for (const item of items)
        set.add(item);
}
//# sourceMappingURL=schema-selection.js.map