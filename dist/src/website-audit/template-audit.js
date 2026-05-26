export function runTemplateAudit(pages = []) {
    const issues = [];
    const findings = [];
    const groups = new Map();
    for (const page of pages)
        groups.set(page.pageType ?? "unknown", [...(groups.get(page.pageType ?? "unknown") ?? []), page]);
    for (const [template, items] of groups.entries()) {
        findings.push(`${template}: ${items.length} page(s)`);
        addRepeated(items.filter((page) => !page.title), "template-missing-title", "Missing title repeated across template", template, issues);
        addRepeated(items.filter((page) => !page.metaDescription), "template-missing-meta-description", "Missing meta descriptions repeated across template", template, issues);
        addRepeated(items.filter((page) => !page.canonicalUrl), "template-missing-canonical", "Missing canonical repeated across template", template, issues);
        addRepeated(items.filter((page) => page.isIndexable === false && ["homepage", "service", "product", "category", "landing", "pricing"].includes(page.pageType ?? "")), "template-important-pages-noindex", "Important template has noindex pages", template, issues, "P1");
    }
    return { findings, issues };
}
function addRepeated(pages, id, title, template, issues, priority = "P2") {
    if (pages.length < 2)
        return;
    issues.push({
        id,
        category: "template-audit",
        sourceSkill: "template-audit",
        title,
        priority,
        problem: `${pages.length} ${template} pages affected`,
        whyItMatters: "Template-level issues can affect many pages and should be fixed at the source.",
        howToFix: "Fix the shared template or CMS/framework source once.",
        do: ["Group repeated issues by template", "Fix template issues at source"],
        dont: ["List the same issue repeatedly without grouping"],
        evidence: pages.map((page) => page.url),
        appliesTo: ["template", "audit"],
        affectedPages: pages.map((page) => page.url),
        affectedTemplates: [template]
    });
}
//# sourceMappingURL=template-audit.js.map