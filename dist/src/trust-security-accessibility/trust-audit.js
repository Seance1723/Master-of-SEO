export function runTrustAudit(input) {
    const normalized = mergeHtmlTrustInput({ ...input, mode: input.mode ?? "audit" });
    if (!hasTrustInput(normalized))
        return needsTrustInput();
    const issues = [
        ...checkOrganizationTrust(normalized),
        ...checkTrustPages(normalized),
        ...checkEEAT(normalized),
        ...checkTestimonials(normalized),
        ...checkCaseStudies(normalized)
    ];
    const missingInputs = missingTrustInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return output(status, `Trust audit completed. Reviewed ${normalized.authors?.length ?? 0} author(s), ${normalized.testimonials?.length ?? 0} testimonial(s), and found ${issues.length} issue(s).`, issues, missingInputs, {
        trustFindings: [`Organization: ${normalized.organization?.name ?? "not provided"}`],
        eeatFindings: [`YMYL: ${normalized.page?.isYMYL === true ? "yes" : "not provided"}`],
        policyFindings: [`Trust pages provided: ${Object.values(normalized.trustPages ?? {}).filter(Boolean).length}`]
    });
}
export function parseTrustInputFromText(rawInput) {
    const input = { mode: rawInput.includes("eeat-audit") ? "eeat" : "trust" };
    const args = rawInput.replace(/^\/seo-master\s+(?:trust-audit|eeat-audit)\s*/u, "").trim();
    for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "html")
            input.html = value;
        if (key === "page")
            input.page = parseJsonFlag(value, undefined);
        if (key === "organization")
            input.organization = parseJsonFlag(value, undefined);
        if (key === "authors")
            input.authors = parseJsonFlag(value, []);
        if (key === "reviewers")
            input.reviewers = parseJsonFlag(value, []);
        if (key === "trustPages" || key === "trust-pages")
            input.trustPages = parseJsonFlag(value, undefined);
        if (key === "testimonials")
            input.testimonials = parseJsonFlag(value, []);
        if (key === "caseStudies" || key === "case-studies")
            input.caseStudies = parseJsonFlag(value, []);
    }
    return input;
}
function mergeHtmlTrustInput(input) {
    if (!input.html)
        return input;
    const links = [...input.html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/giu)].map((match) => ({ href: match[1] ?? "", text: stripTags(match[2] ?? "").toLowerCase() }));
    const trustPages = { ...input.trustPages };
    for (const link of links) {
        if (link.text.includes("about"))
            trustPages.aboutUrl ??= link.href;
        if (link.text.includes("contact"))
            trustPages.contactUrl ??= link.href;
        if (link.text.includes("privacy"))
            trustPages.privacyPolicyUrl ??= link.href;
        if (link.text.includes("terms"))
            trustPages.termsUrl ??= link.href;
        if (link.text.includes("refund") || link.text.includes("return"))
            trustPages.refundPolicyUrl ??= link.href;
        if (link.text.includes("shipping"))
            trustPages.shippingPolicyUrl ??= link.href;
        if (link.text.includes("security"))
            trustPages.securityUrl ??= link.href;
    }
    const title = textMatch(input.html, /<title[^>]*>([\s\S]*?)<\/title>/iu);
    const bodyText = stripTags(textMatch(input.html, /<body[^>]*>([\s\S]*?)<\/body>/iu) ?? input.html);
    return { ...input, page: { ...input.page, title: input.page?.title ?? title, bodyText: input.page?.bodyText ?? bodyText }, trustPages };
}
function checkOrganizationTrust(input) {
    const issues = [];
    const commercial = ["homepage", "service", "product", "local", "ecommerce", "pricing"].includes(input.page?.pageType ?? "");
    if (commercial && !input.organization?.name)
        issues.push(issue("commercial-site-missing-organization-name", "organization-trust", "P2", "Commercial site missing organization name", "Show who owns or operates the website.", [input.page?.pageType ?? "commercial page"], ["trust", "audit"]));
    if (commercial && !input.trustPages?.contactUrl && !input.organization?.phone && !input.organization?.email)
        issues.push(issue("commercial-site-missing-contact", "contact-transparency", "P2", "Commercial site missing contact details", "Provide a contact page or real contact details.", [input.page?.pageType ?? "commercial page"], ["trust", "audit"]));
    for (const sameAs of input.organization?.sameAs ?? [])
        if (!isUrl(sameAs))
            issues.push(issue("organization-invalid-sameas", "organization-trust", "P3", "Organization sameAs is not a valid URL", "Use only real sameAs profile URLs.", [sameAs], ["trust", "audit"]));
    return issues;
}
function checkTrustPages(input) {
    const issues = [];
    const commercial = ["homepage", "service", "product", "local", "ecommerce", "pricing"].includes(input.page?.pageType ?? "");
    if (commercial && !input.trustPages?.privacyPolicyUrl)
        issues.push(issue("missing-privacy-policy", "legal-policy-readiness", "P2", "Privacy policy missing", "Add a reviewed privacy policy.", [input.page?.url ?? "site"], ["trust", "audit"]));
    if (["ecommerce", "product", "service", "pricing"].includes(input.page?.pageType ?? "") && !input.trustPages?.termsUrl)
        issues.push(issue("missing-terms", "legal-policy-readiness", "P2", "Terms page missing", "Add terms and conditions where relevant.", [input.page?.pageType ?? "commercial"], ["trust", "audit"]));
    if (input.page?.pageType === "ecommerce" && !input.trustPages?.refundPolicyUrl)
        issues.push(issue("missing-refund-policy", "legal-policy-readiness", "P2", "Refund/return policy missing for ecommerce", "Add a real refund or return policy.", [input.page.url ?? "ecommerce"], ["trust", "audit"]));
    if (input.page?.pageType === "ecommerce" && !input.trustPages?.shippingPolicyUrl)
        issues.push(issue("missing-shipping-policy", "legal-policy-readiness", "P2", "Shipping policy missing for ecommerce", "Add a real shipping policy.", [input.page.url ?? "ecommerce"], ["trust", "audit"]));
    return issues;
}
function checkEEAT(input) {
    const issues = [];
    const article = ["blog", "article"].includes(input.page?.pageType ?? "");
    if (input.page?.isYMYL && (!input.authors?.length || !hasCredentials(input.authors)) && (!input.reviewers?.length || !hasCredentials(input.reviewers)))
        issues.push(issue("ymyl-missing-expert-author-reviewer", "eeat", "P1", "YMYL page lacks author/reviewer credentials", "Add real author or reviewer expertise for high-stakes content.", [input.page.title ?? "YMYL page"], ["eeat", "trust", "audit"]));
    if (article && !input.authors?.length)
        issues.push(issue("article-missing-author", "author-reviewer-trust", "P2", "Article/blog missing author", "Show real author responsibility where relevant.", [input.page?.title ?? "article"], ["eeat", "trust", "audit"]));
    for (const author of input.authors ?? []) {
        if (!author.bio && article)
            issues.push(issue("author-missing-bio", "author-reviewer-trust", "P3", "Author bio missing", "Add a useful author bio for expert content.", [author.name], ["eeat", "trust", "audit"]));
        for (const sameAs of author.sameAs ?? [])
            if (!isUrl(sameAs))
                issues.push(issue("author-invalid-sameas", "author-reviewer-trust", "P3", "Author sameAs is not a valid URL", "Use real author profile URLs.", [author.name, sameAs], ["eeat", "audit"]));
    }
    if (input.page?.claims?.length && !input.caseStudies?.length && !input.testimonials?.length)
        issues.push(issue("claims-without-proof", "trust-seo", "P2", "Claims provided without proof, testimonials, or case studies", "Support important claims with real evidence.", input.page.claims, ["trust", "eeat", "audit"]));
    return issues;
}
function checkTestimonials(input) {
    const issues = [];
    for (const testimonial of input.testimonials ?? []) {
        if (testimonial.rating !== undefined && (testimonial.rating < 1 || testimonial.rating > 5))
            issues.push(issue("testimonial-rating-out-of-range", "testimonial-review-guard", "P2", "Testimonial rating outside 1-5", "Use only valid genuine ratings.", [String(testimonial.rating)], ["trust", "audit"]));
        if (!testimonial.name && !testimonial.source && testimonial.isVerified !== true)
            issues.push(issue("testimonial-unverified-missing-source", "testimonial-review-guard", "P3", "Testimonial lacks name, source, or verification", "Show source or verification where possible.", [testimonial.text ?? "testimonial"], ["trust", "audit"]));
    }
    return issues;
}
function checkCaseStudies(input) {
    return (input.caseStudies ?? []).filter((item) => !item.result).map((item) => issue("case-study-missing-result", "trust-seo", "P3", "Case study missing result/proof", "Include real results or proof where available.", [item.title ?? item.url ?? "case study"], ["trust", "eeat", "audit"]));
}
function hasTrustInput(input) {
    return Boolean(input.html || input.page || input.organization || input.authors?.length || input.reviewers?.length || input.trustPages || input.testimonials?.length || input.caseStudies?.length);
}
function missingTrustInputs(input) {
    const missing = [];
    if (!input.page && !input.html)
        missing.push("page or html");
    if (!input.organization)
        missing.push("organization");
    if (!input.authors?.length)
        missing.push("authors");
    if (!input.trustPages)
        missing.push("trustPages");
    return missing;
}
export function needsTrustInput() {
    return output("needs_input", "Needs input. Provide HTML, organization, author, policy, testimonial, case study, or page data.", [], ["html", "page", "organization", "authors", "reviewers", "trustPages", "testimonials", "caseStudies"], {});
}
export function output(status, summary, issues, missingInputs, findings) {
    return { skill: "trust-security-accessibility", status, score: score(issues), summary, trustFindings: findings.trustFindings ?? [], eeatFindings: findings.eeatFindings ?? [], securityFindings: findings.securityFindings ?? [], accessibilityFindings: findings.accessibilityFindings ?? [], policyFindings: findings.policyFindings ?? [], issues, missingInputs, nextActions: issues.length ? ["Fix P0/P1 trust, security, accessibility, and policy risks first.", "Provide explicit inputs for deeper checks."] : ["Keep trust, security, and accessibility signals accurate and visible."] };
}
export function issue(id, category, priority, title, howToFix, evidence, appliesTo) {
    return { id, category, title, priority, problem: evidence.join("; "), whyItMatters: "Trust, security, and accessibility affect user confidence, search quality, crawlability, usability, and risk. No live validation was performed.", howToFix, do: ["Use only provided evidence", "Show real trust and accessibility signals", "Fix security and sensitive-data risks quickly"], dont: ["Invent authors, reviews, policies, security status, or accessibility status", "Hide business responsibility", "Treat security or accessibility risks as cosmetic"], evidence, appliesTo };
}
export function score(issues) {
    return Math.max(0, 100 - issues.reduce((sum, item) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[item.priority]), 0));
}
export function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value.replace(/\\"/gu, "\""));
    }
    catch {
        return fallback;
    }
}
function hasCredentials(items) {
    return items.some((item) => item.credentials?.length);
}
function isUrl(value) {
    return /^https?:\/\//iu.test(value);
}
function textMatch(html, pattern) {
    return pattern.exec(html)?.[1];
}
function stripTags(value) {
    return value.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}
//# sourceMappingURL=trust-audit.js.map