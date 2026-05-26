import { issue, needsInput, parseJsonFlag, score } from "./local-seo-audit.js";
export function runInternationalSEOAudit(input) {
    const normalized = { ...input, mode: input.mode ?? "audit" };
    if (!hasInput(normalized))
        return needsInput("international");
    const issues = [
        ...checkHreflang(normalized),
        ...checkLocalization(normalized),
        ...checkUrlStructure(normalized)
    ];
    const missingInputs = getMissingInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "local-international-seo",
        status,
        score: score(issues),
        summary: `${status === "partial" ? "Partial international SEO audit completed" : "International SEO audit completed"}. Reviewed ${normalized.pages?.length ?? 0} page(s), ${normalized.hreflangSets?.length ?? 0} hreflang set(s), and found ${issues.length} issue(s).`,
        localFindings: [],
        internationalFindings: [`URL strategy: ${normalized.site?.urlStrategy ?? "not provided"}`],
        hreflangFindings: [`Hreflang sets reviewed: ${normalized.hreflangSets?.length ?? 0}`],
        napFindings: [],
        localPageFindings: [],
        localizedContentFindings: [`Localized content records reviewed: ${normalized.localizedContent?.length ?? 0}`],
        issues,
        missingInputs,
        nextActions: issues.length ? ["Fix P1/P2 hreflang, canonical, and localization issues first.", "Provide complete alternate page sets for deeper validation."] : ["Keep hreflang, canonicals, and localization aligned."]
    };
}
export function parseInternationalSEOInputFromText(rawInput) {
    const input = { mode: rawInput.includes("hreflang-audit") ? "hreflang" : "audit" };
    const args = rawInput.replace(/^\/seo-master\s+(?:international-seo|international-seo-audit|hreflang-audit)\s*/u, "").trim();
    const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
    for (const match of args.matchAll(flagPattern)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "site")
            input.site = parseJsonFlag(value, undefined);
        if (key === "pages")
            input.pages = parseJsonFlag(value, []);
        if (key === "hreflangSets" || key === "hreflang-sets")
            input.hreflangSets = parseJsonFlag(value, []);
        if (key === "localizedContent" || key === "localized-content")
            input.localizedContent = parseJsonFlag(value, []);
        if (key === "mode" && ["audit", "hreflang", "localization", "planning"].includes(value))
            input.mode = value;
    }
    return input;
}
export function runHreflangAudit(input) {
    return runInternationalSEOAudit({ ...input, mode: "hreflang" });
}
function checkHreflang(input) {
    const issues = [];
    const pageMap = new Map((input.pages ?? []).map((page) => [page.url, page]));
    const setBySource = new Map((input.hreflangSets ?? []).map((set) => [set.sourceUrl, set]));
    for (const set of input.hreflangSets ?? []) {
        if (!set.alternates.some((alt) => alt.url === set.sourceUrl))
            issues.push(issue("hreflang-missing-self-reference", "hreflang", "P2", "Hreflang set missing self-reference", "Add self-referencing hreflang to every alternate set.", [set.sourceUrl], ["hreflang", "audit"]));
        if (!set.alternates.some((alt) => alt.lang === "x-default"))
            issues.push(issue("hreflang-missing-x-default", "x-default", "P3", "Hreflang set missing x-default fallback", "Add x-default for global selector/fallback pages when useful.", [set.sourceUrl], ["hreflang", "audit"]));
        for (const alt of set.alternates) {
            if (!isValidHreflang(alt.lang))
                issues.push(issue("invalid-hreflang-code", "hreflang", "P2", "Invalid hreflang code", "Use valid language or language-country codes.", [alt.lang, alt.url], ["hreflang", "audit"]));
            if (alt.lang !== "x-default" && !pageMap.has(alt.url))
                issues.push(issue("hreflang-url-not-in-page-set", "hreflang", "P3", "Hreflang URL not found in provided page set", "Provide all alternate URLs or verify the URL manually.", [alt.url], ["hreflang", "audit"]));
            const target = pageMap.get(alt.url);
            if (target?.isIndexable === false)
                issues.push(issue("hreflang-to-non-indexable-url", "hreflang", "P2", "Hreflang points to non-indexable page", "Point hreflang only to indexable canonical URLs.", [alt.url], ["hreflang", "audit"]));
            if (target?.canonicalUrl && target.canonicalUrl !== alt.url)
                issues.push(issue("hreflang-canonical-mismatch", "hreflang", "P2", "Hreflang URL canonicalizes elsewhere", "Align canonical and hreflang URLs.", [alt.url, target.canonicalUrl], ["hreflang", "audit"]));
            const reciprocal = setBySource.get(alt.url);
            if (alt.lang !== "x-default" && alt.url !== set.sourceUrl && !reciprocal?.alternates.some((returnAlt) => returnAlt.url === set.sourceUrl))
                issues.push(issue("hreflang-missing-return-tag", "hreflang", "P2", "Hreflang alternate missing return tag", "Include return tags across all alternates.", [set.sourceUrl, alt.url], ["hreflang", "audit"]));
        }
        const seenLangs = new Set();
        for (const alt of set.alternates) {
            if (seenLangs.has(alt.lang))
                issues.push(issue("duplicate-language-country-alternate", "hreflang", "P2", "Duplicate language/country alternate in set", "Keep one URL per hreflang code in each set.", [set.sourceUrl, alt.lang], ["hreflang", "audit"]));
            seenLangs.add(alt.lang);
        }
    }
    return issues;
}
function checkLocalization(input) {
    const issues = [];
    for (const content of input.localizedContent ?? []) {
        if (content.mixedLanguageDetected)
            issues.push(issue("mixed-language-detected", "localized-content", "P2", "Mixed language content detected", "Keep each localized page in the intended language.", [content.url], ["international_seo", "audit"]));
        if (content.translationQuality === "machine")
            issues.push(issue("machine-translation-quality-warning", "localized-content", "P2", "Machine translation quality risk", "Use native-quality review before publishing.", [content.url], ["international_seo", "audit"]));
        if (content.country && content.localizedCurrency === false)
            issues.push(issue("currency-not-localized", "language-country-targeting", "P3", "Currency not localized for country target", "Localize currency where relevant.", [content.url], ["international_seo", "audit"]));
        if (content.country && content.localizedUnits === false)
            issues.push(issue("units-not-localized", "language-country-targeting", "P3", "Units not localized for country target", "Localize units where relevant.", [content.url], ["international_seo", "audit"]));
    }
    for (const page of input.pages ?? []) {
        if (page.canonicalUrl) {
            const canonical = input.pages?.find((item) => item.url === page.canonicalUrl);
            if (canonical && page.language && canonical.language && page.language !== canonical.language)
                issues.push(issue("localized-page-canonicalized-different-language", "international-seo", "P2", "Localized page canonicalized to a different language", "Use self-canonical for distinct localized pages.", [page.url, page.canonicalUrl], ["international_seo", "audit"]));
        }
        if (!page.language && !page.country)
            issues.push(issue("country-page-missing-language-country", "language-country-targeting", "P2", "Page missing language/country metadata", "Provide language and country targeting metadata.", [page.url], ["international_seo", "audit"]));
    }
    const titleGroups = new Map();
    for (const page of input.pages ?? [])
        if (page.title)
            titleGroups.set(page.title.toLowerCase(), [...(titleGroups.get(page.title.toLowerCase()) ?? []), page.url]);
    for (const [title, urls] of titleGroups.entries())
        if (urls.length > 1 && title)
            issues.push(issue("metadata-not-localized", "localized-content", "P3", "Same title used across localized pages", "Localize metadata for each language/region.", urls, ["international_seo", "audit"]));
    return issues;
}
function checkUrlStructure(input) {
    const issues = [];
    if (input.site?.urlStrategy === "parameter")
        issues.push(issue("parameter-language-url-strategy", "international-url-structure", "P3", "Parameter-only language URL strategy", "Prefer consistent subdirectories, subdomains, or ccTLDs where possible.", [input.site.defaultUrl ?? "site"], ["international_seo", "audit"]));
    const detected = new Set();
    for (const page of input.pages ?? []) {
        if (/\/[a-z]{2}(?:-[a-z]{2})?\//iu.test(page.url))
            detected.add("subdirectory");
        if (/\/\/[a-z]{2}[.-]/iu.test(page.url))
            detected.add("subdomain");
        if (/[?&](lang|locale)=/iu.test(page.url))
            detected.add("parameter");
    }
    if (detected.size > 1)
        issues.push(issue("mixed-international-url-strategies", "international-url-structure", "P2", "Mixed international URL strategies detected", "Use one predictable international URL strategy.", [...detected], ["international_seo", "audit"]));
    return issues;
}
function hasInput(input) {
    return Boolean(input.site || input.pages?.length || input.hreflangSets?.length || input.localizedContent?.length);
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.site)
        missing.push("site");
    if (!input.pages?.length)
        missing.push("pages");
    if (!input.hreflangSets?.length)
        missing.push("hreflangSets");
    if (!input.localizedContent?.length)
        missing.push("localizedContent");
    return missing;
}
function isValidHreflang(lang) {
    return lang === "x-default" || /^[a-z]{2,3}(?:-[A-Z]{2})?$/u.test(lang);
}
//# sourceMappingURL=international-seo-audit.js.map