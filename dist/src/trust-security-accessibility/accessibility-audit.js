import { issue, output, parseJsonFlag } from "./trust-audit.js";
export function runAccessibilityAudit(input) {
    const normalized = mergeHtmlAccessibilityInput({ ...input, mode: input.mode ?? "accessibility" });
    if (!hasInput(normalized))
        return needsAccessibilityInput();
    const issues = [
        ...checkPageBasics(normalized),
        ...checkHeadings(normalized),
        ...checkImages(normalized),
        ...checkLinksButtons(normalized),
        ...checkForms(normalized),
        ...checkSignals(normalized)
    ];
    const missingInputs = missingAccessibilityInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return output(status, `Accessibility SEO audit completed. Reviewed ${normalized.headings?.length ?? 0} heading(s), ${normalized.images?.length ?? 0} image(s), and found ${issues.length} issue(s).`, issues, missingInputs, {
        accessibilityFindings: [`Language: ${normalized.page?.language ?? "not provided"}`]
    });
}
export function parseAccessibilityInputFromText(rawInput) {
    const input = { mode: "accessibility" };
    const args = rawInput.replace(/^\/seo-master\s+accessibility-audit\s*/u, "").trim();
    for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "html")
            input.html = value;
        if (key === "page")
            input.page = parseJsonFlag(value, undefined);
        if (key === "headings")
            input.headings = parseJsonFlag(value, []);
        if (key === "images")
            input.images = parseJsonFlag(value, []);
        if (key === "forms")
            input.forms = parseJsonFlag(value, []);
        if (key === "links")
            input.links = parseJsonFlag(value, []);
        if (key === "buttons")
            input.buttons = parseJsonFlag(value, []);
        if (key === "accessibilitySignals" || key === "accessibility-signals")
            input.accessibilitySignals = parseJsonFlag(value, undefined);
    }
    return input;
}
function mergeHtmlAccessibilityInput(input) {
    if (!input.html)
        return input;
    const title = /<title[^>]*>([\s\S]*?)<\/title>/iu.exec(input.html)?.[1]?.trim();
    const language = /<html[^>]+lang=["']([^"']+)["']/iu.exec(input.html)?.[1];
    const headings = input.headings ?? [...input.html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/giu)].map((match) => ({ level: (match[1] ?? "h2").toLowerCase(), text: stripTags(match[2] ?? "") }));
    const images = input.images ?? [...input.html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/giu)].map((match) => {
        const raw = match[0] ?? "";
        return { src: match[1] ?? "", alt: /alt=["']([^"']*)["']/iu.exec(raw)?.[1] };
    });
    const buttons = input.buttons ?? [...input.html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/giu)].map((match) => ({ text: stripTags(match[1] ?? ""), ariaLabel: /aria-label=["']([^"']+)["']/iu.exec(match[0] ?? "")?.[1] }));
    return { ...input, page: { ...input.page, title: input.page?.title ?? title, language: input.page?.language ?? language }, headings, images, buttons };
}
function checkPageBasics(input) {
    const issues = [];
    if (!input.page?.title)
        issues.push(issue("accessibility-missing-page-title", "accessibility", "P2", "Page title missing", "Provide a descriptive page title.", [input.page?.url ?? input.url ?? "page"], ["accessibility", "audit"]));
    if (!input.page?.language || input.accessibilitySignals?.missingLangKnown)
        issues.push(issue("accessibility-missing-html-lang", "semantic-html", "P3", "HTML language not provided", "Set the html lang attribute.", [input.page?.url ?? "page"], ["accessibility", "audit"]));
    return issues;
}
function checkHeadings(input) {
    const headings = input.headings ?? [];
    const issues = [];
    const h1s = headings.filter((heading) => heading.level === "h1");
    if (!h1s.length)
        issues.push(issue("accessibility-missing-h1", "heading-accessibility", "P2", "Missing H1", "Use one clear H1.", [input.page?.url ?? "page"], ["accessibility", "audit"]));
    if (h1s.length > 1)
        issues.push(issue("accessibility-multiple-h1", "heading-accessibility", "P2", "Multiple H1s found", "Use one primary H1 where possible.", h1s.map((heading) => heading.text), ["accessibility", "audit"]));
    for (const heading of headings)
        if (!heading.text.trim())
            issues.push(issue("accessibility-empty-heading", "heading-accessibility", "P2", "Empty heading found", "Remove empty headings or add descriptive text.", [heading.level], ["accessibility", "audit"]));
    for (let index = 1; index < headings.length; index += 1) {
        if (level(headings[index].level) - level(headings[index - 1].level) > 1)
            issues.push(issue("accessibility-skipped-heading-hierarchy", "heading-accessibility", "P3", "Skipped heading hierarchy", "Follow logical heading order.", [`${headings[index - 1].level} to ${headings[index].level}`], ["accessibility", "audit"]));
    }
    return issues;
}
function checkImages(input) {
    const issues = [];
    for (const image of input.images ?? []) {
        if (image.isDecorative && (image.alt ?? "") === "")
            continue;
        if (image.alt === undefined || image.alt.trim() === "")
            issues.push(issue("accessibility-image-missing-alt", "image-alt-accessibility", "P2", "Meaningful image missing alt text", "Add meaningful alt text or mark decorative images with empty alt.", [image.src], ["accessibility", "audit"]));
    }
    return issues;
}
function checkLinksButtons(input) {
    const issues = [];
    const genericLinks = (input.links ?? []).filter((link) => /^(click here|read more|more)$/iu.test((link.text ?? "").trim()));
    for (const link of input.links ?? [])
        if (!link.text && !link.ariaLabel)
            issues.push(issue("accessibility-link-missing-name", "semantic-html", "P2", "Link missing text or aria-label", "Give links accessible names.", [link.href], ["accessibility", "audit"]));
    if (genericLinks.length > 1)
        issues.push(issue("accessibility-repeated-generic-link-text", "semantic-html", "P3", "Repeated generic link text", "Use descriptive link text.", genericLinks.map((link) => link.href), ["accessibility", "audit"]));
    for (const button of input.buttons ?? [])
        if (!button.text?.trim() && !button.ariaLabel)
            issues.push(issue("accessibility-button-missing-name", "semantic-html", "P2", "Button missing text or aria-label", "Give buttons accessible names.", [button.type ?? "button"], ["accessibility", "audit"]));
    return issues;
}
function checkForms(input) {
    const issues = [];
    for (const form of input.forms ?? [])
        for (const field of form.fields ?? []) {
            if (!field.label && !field.ariaLabel)
                issues.push(issue("accessibility-form-field-missing-label", "form-accessibility", "P2", "Form field missing label or aria-label", "Provide a visible label or accessible name.", [field.name ?? field.id ?? field.type ?? "field"], ["accessibility", "audit"]));
            if (field.required && !field.label?.includes("*") && !field.ariaLabel?.toLowerCase().includes("required"))
                issues.push(issue("accessibility-required-field-not-indicated", "form-accessibility", "P3", "Required field lacks accessible required indication", "Mark required fields accessibly.", [field.name ?? field.id ?? "field"], ["accessibility", "audit"]));
        }
    return issues;
}
function checkSignals(input) {
    const issues = [];
    if (input.accessibilitySignals?.keyboardTrapsKnown)
        issues.push(issue("accessibility-keyboard-trap-known", "keyboard-navigation", "P1", "Known keyboard trap provided", "Fix keyboard traps immediately.", [input.page?.url ?? "page"], ["accessibility", "audit"]));
    if (input.accessibilitySignals?.lowContrastKnown)
        issues.push(issue("accessibility-low-contrast-known", "contrast-readability", "P2", "Known low contrast issue provided", "Improve contrast and readability.", [input.page?.url ?? "page"], ["accessibility", "audit"]));
    if (input.accessibilitySignals?.autoplayMediaKnown)
        issues.push(issue("accessibility-autoplay-media-known", "accessibility", "P2", "Known autoplay media issue provided", "Avoid autoplay media with sound.", [input.page?.url ?? "page"], ["accessibility", "audit"]));
    return issues;
}
function hasInput(input) {
    return Boolean(input.html || input.page || input.headings?.length || input.images?.length || input.forms?.length || input.links?.length || input.buttons?.length || input.accessibilitySignals);
}
function missingAccessibilityInputs(input) {
    const missing = [];
    if (!input.page && !input.html)
        missing.push("page or html");
    if (!input.headings?.length)
        missing.push("headings");
    if (!input.images?.length)
        missing.push("images");
    if (!input.forms?.length)
        missing.push("forms");
    if (!input.links?.length)
        missing.push("links");
    if (!input.buttons?.length)
        missing.push("buttons");
    if (!input.accessibilitySignals)
        missing.push("accessibilitySignals");
    return missing;
}
function needsAccessibilityInput() {
    return output("needs_input", "Needs input. Provide HTML, headings, images, forms, links, buttons, page, or accessibility signal data.", [], ["html", "page", "headings", "images", "forms", "links", "buttons", "accessibilitySignals"], {});
}
function level(value) {
    return Number(value.replace("h", ""));
}
function stripTags(value) {
    return value.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}
//# sourceMappingURL=accessibility-audit.js.map