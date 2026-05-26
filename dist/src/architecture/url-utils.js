export function normalizeUrl(url) {
    const clean = url.split("#")[0].trim();
    try {
        const parsed = new URL(clean, "https://example.com");
        const path = parsed.pathname.replace(/\/+$/u, "") || "/";
        return `${parsed.hostname === "example.com" && clean.startsWith("/") ? "" : parsed.origin.toLowerCase()}${path.toLowerCase()}`;
    }
    catch {
        return clean.toLowerCase().replace(/#.*$/u, "").replace(/\/+$/u, "") || "/";
    }
}
export function isHomepage(url) {
    const normalized = normalizeUrl(url);
    return normalized === "/" || /^https?:\/\/[^/]+\/?$/iu.test(normalized);
}
//# sourceMappingURL=url-utils.js.map