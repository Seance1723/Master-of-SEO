export function runFrameworkSEOAudit(input) {
    const normalized = mergeHtmlInput({ ...input, mode: input.mode ?? "audit" });
    if (!hasInput(normalized))
        return needsInput();
    const framework = detectFramework(normalized);
    const issues = [
        ...checkRoutes(normalized, framework),
        ...checkWordPress(normalized),
        ...checkReact(normalized, framework),
        ...checkNext(normalized, framework),
        ...checkStatic(normalized, framework),
        ...checkSeoFiles(normalized),
        ...checkBuild(normalized)
    ];
    const missingInputs = getMissingInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "cms-framework-seo",
        status,
        score: score(issues),
        summary: `${status === "partial" ? "Partial CMS/framework SEO audit completed" : "CMS/framework SEO audit completed"}. Detected ${framework}; reviewed ${normalized.routes?.length ?? 0} route(s), ${normalized.cms?.plugins?.length ?? 0} plugin(s), and found ${issues.length} issue(s).`,
        frameworkFindings: [`Framework: ${framework}`, `Mode: ${normalized.mode ?? "audit"}`],
        wordpressFindings: normalized.cms?.name === "wordpress" ? [`WordPress settings reviewed: ${Object.keys(normalized.cms.settings ?? {}).length}`] : [],
        reactFindings: framework === "react" ? ["React checks applied"] : [],
        nextjsFindings: framework === "nextjs" ? ["Next.js checks applied"] : [],
        staticFindings: framework === "static" ? ["Static site checks applied"] : [],
        buildFindings: [`Build status: ${normalized.build?.status ?? "not provided"}`],
        issues,
        missingInputs,
        nextActions: issues.length ? ["Fix P0/P1 build, indexability, rendering, and metadata issues first.", "Provide explicit framework, route, build, CMS, and SEO file inputs for deeper checks."] : ["Keep route-level metadata, sitemap, robots, canonical, and build output aligned."]
    };
}
export function parseCMSFrameworkInputFromText(rawInput) {
    const input = { mode: commandMode(rawInput) };
    const args = rawInput.replace(/^\/seo-master\s+(?:framework-seo-audit|wordpress-seo-audit|react-seo-audit|nextjs-seo-audit|static-seo-audit|build-seo-check)\s*/u, "").trim();
    for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "html")
            input.html = value;
        if (key === "framework")
            input.framework = value;
        if (key === "cms")
            input.cms = parseJsonFlag(value, undefined);
        if (key === "packageJson" || key === "package-json")
            input.packageJson = parseJsonFlag(value, undefined);
        if (key === "frameworkConfig" || key === "framework-config")
            input.frameworkConfig = parseJsonFlag(value, undefined);
        if (key === "routes")
            input.routes = parseJsonFlag(value, []);
        if (key === "build")
            input.build = parseJsonFlag(value, undefined);
        if (key === "seoFiles" || key === "seo-files")
            input.seoFiles = parseJsonFlag(value, undefined);
    }
    return input;
}
function commandMode(rawInput) {
    if (rawInput.includes("wordpress-seo-audit"))
        return "wordpress";
    if (rawInput.includes("react-seo-audit"))
        return "react";
    if (rawInput.includes("nextjs-seo-audit"))
        return "nextjs";
    if (rawInput.includes("static-seo-audit"))
        return "static";
    if (rawInput.includes("build-seo-check"))
        return "build";
    return "framework";
}
function mergeHtmlInput(input) {
    if (!input.html)
        return input;
    const title = /<title[^>]*>([\s\S]*?)<\/title>/iu.exec(input.html)?.[1]?.trim();
    const metaDescription = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/iu.exec(input.html)?.[1];
    const canonicalUrl = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/iu.exec(input.html)?.[1];
    const robots = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/iu.exec(input.html)?.[1];
    const hasOpenGraph = /property=["']og:/iu.test(input.html);
    const hasJsonLd = /application\/ld\+json/iu.test(input.html);
    const body = /<body[^>]*>([\s\S]*?)<\/body>/iu.exec(input.html)?.[1] ?? input.html;
    const text = stripTags(body);
    const route = input.routes?.[0] ?? {
        path: input.url ?? "/",
        title,
        metaDescription,
        canonicalUrl,
        robots,
        hasOpenGraph,
        hasJsonLd,
        isIndexable: robots ? !/noindex/iu.test(robots) : undefined,
        rendering: isEmptyRoot(input.html, text) ? "csr" : "static"
    };
    return { ...input, routes: input.routes ?? [route] };
}
export function detectFramework(input) {
    if (input.framework)
        return input.framework;
    if (input.cms?.name === "wordpress")
        return "wordpress";
    const deps = { ...input.packageJson?.["dependencies"], ...input.packageJson?.["devDependencies"] };
    if ("next" in deps)
        return "nextjs";
    if ("@remix-run/react" in deps || "@remix-run/node" in deps)
        return "remix";
    if ("astro" in deps)
        return "astro";
    if ("nuxt" in deps)
        return "nuxt";
    if ("vue" in deps)
        return "vue";
    if ("@angular/core" in deps)
        return "angular";
    if ("svelte" in deps || "@sveltejs/kit" in deps)
        return "svelte";
    if ("react" in deps)
        return "react";
    if (input.html && /wp-content|wp-json|wordpress/iu.test(input.html))
        return "wordpress";
    if (input.html && /id=["']root["']|data-reactroot|__NEXT_DATA__/iu.test(input.html))
        return input.html.includes("__NEXT_DATA__") ? "nextjs" : "react";
    return input.mode === "static" ? "static" : "unknown";
}
function checkRoutes(input, framework) {
    const issues = [];
    const metadata = new Map();
    for (const route of input.routes ?? []) {
        const privateRoute = /\/(admin|dashboard|login|account|checkout|cart)(\/|$)/iu.test(route.path);
        const placeholder = /placeholder|coming-soon|lorem ipsum|todo/iu.test(`${route.title ?? ""} ${route.metaDescription ?? ""}`);
        if (!privateRoute && route.isIndexable !== false && !route.title)
            issues.push(issue("public-route-missing-title", "route-level-seo", "P1", "Public route missing title", "Generate unique route-level titles.", [route.path], ["framework", "audit"]));
        if (!privateRoute && route.isIndexable !== false && !route.metaDescription)
            issues.push(issue("public-route-missing-meta-description", "route-level-seo", "P2", "Public route missing meta description", "Generate useful route-level meta descriptions.", [route.path], ["framework", "audit"]));
        if (!privateRoute && route.isIndexable !== false && !route.canonicalUrl)
            issues.push(issue("public-route-missing-canonical", "canonical-generation", "P2", "Public route missing canonical", "Generate canonical URLs consistently.", [route.path], ["framework", "audit"]));
        if (!privateRoute && route.hasOpenGraph === false)
            issues.push(issue("public-route-missing-open-graph", "social-metadata", "P3", "Public route missing Open Graph metadata", "Add social metadata for shareable routes.", [route.path], ["framework", "audit"]));
        if (!privateRoute && route.hasJsonLd === false)
            issues.push(issue("public-route-missing-jsonld", "jsonld-rendering", "P3", "Public route missing JSON-LD", "Render schema only from real visible data.", [route.path], ["framework", "audit"]));
        if (privateRoute && route.isIndexable !== false)
            issues.push(issue("private-route-indexable", "route-level-seo", "P1", "Private route is indexable", "Noindex private, dashboard, cart, checkout, account, login, and admin routes.", [route.path], ["framework", "audit"]));
        if (placeholder && route.isIndexable !== false)
            issues.push(issue("placeholder-route-indexable", "route-level-seo", "P2", "Placeholder route is indexable", "Noindex or finish placeholder pages before publishing.", [route.path], ["framework", "audit"]));
        if (route.canonicalUrl && /localhost|staging|\.test|\.local/iu.test(route.canonicalUrl))
            issues.push(issue("canonical-staging-localhost", "canonical-generation", "P2", "Canonical uses localhost or staging URL", "Use production canonical URLs.", [route.path, route.canonicalUrl], [framework === "nextjs" ? "nextjs" : "framework", "audit"]));
        const key = `${route.title ?? ""}|${route.metaDescription ?? ""}`;
        if (route.title && route.metaDescription)
            metadata.set(key, [...(metadata.get(key) ?? []), route.path]);
    }
    for (const paths of metadata.values())
        if (paths.length > 1)
            issues.push(issue("duplicate-route-metadata", "dynamic-metadata", "P2", "Duplicate metadata across routes", "Generate unique metadata per route.", paths, ["framework", "audit"]));
    return issues;
}
function checkWordPress(input) {
    if (input.cms?.name !== "wordpress" && input.framework !== "wordpress" && input.mode !== "wordpress")
        return [];
    const issues = [];
    const settings = input.cms?.settings;
    if (settings?.discourageSearchEngines)
        issues.push(issue("wordpress-discourage-search-engines", "wordpress-seo", "P1", "WordPress discourages search engines", "Disable discourage search engines before launch.", ["discourageSearchEngines"], ["wordpress", "cms", "audit"]));
    if (!settings?.permalinkStructure || settings.permalinkStructure === "plain" || settings.permalinkStructure.includes("?p="))
        issues.push(issue("wordpress-plain-permalink", "wordpress-permalinks", "P2", "WordPress permalink structure is missing or plain", "Use post name or a logical custom structure.", [settings?.permalinkStructure ?? "missing"], ["wordpress", "cms", "audit"]));
    if (settings?.attachmentPagesIndexable)
        issues.push(issue("wordpress-attachment-pages-indexable", "wordpress-archives-attachments", "P2", "Attachment pages are indexable", "Noindex, disable, or redirect low-value attachment pages.", ["attachmentPagesIndexable"], ["wordpress", "cms", "audit"]));
    if (settings?.tagArchivesIndexable)
        issues.push(issue("wordpress-tag-archives-indexable", "wordpress-archives-attachments", "P3", "Tag archives are indexable", "Index only useful optimized tag archives.", ["tagArchivesIndexable"], ["wordpress", "cms", "audit"]));
    if (settings?.authorArchivesIndexable || settings?.dateArchivesIndexable)
        issues.push(issue("wordpress-author-date-archives-indexable", "wordpress-archives-attachments", "P3", "Author/date archives are indexable", "Noindex low-value author/date archives unless useful.", ["author/date archives"], ["wordpress", "cms", "audit"]));
    if (settings?.xmlSitemapEnabled === false)
        issues.push(issue("wordpress-xml-sitemap-disabled", "wordpress-seo", "P2", "WordPress XML sitemap disabled", "Enable XML sitemap for canonical indexable URLs.", ["xmlSitemapEnabled false"], ["wordpress", "cms", "audit"]));
    const active = (input.cms?.plugins ?? []).filter((plugin) => plugin.active !== false);
    const seoPlugins = active.filter((plugin) => plugin.type === "seo");
    if (seoPlugins.length > 1)
        issues.push(issue("wordpress-multiple-active-seo-plugins", "wordpress-plugin-conflict", "P2", "Multiple active SEO plugins detected", "Use one primary SEO metadata source.", seoPlugins.map((plugin) => plugin.name), ["wordpress", "cms", "audit"]));
    const cachePlugins = active.filter((plugin) => ["cache", "performance"].includes(plugin.type ?? ""));
    if (cachePlugins.length > 1)
        issues.push(issue("wordpress-multiple-cache-performance-plugins", "wordpress-plugin-conflict", "P3", "Multiple cache/performance plugins detected", "Review cache/performance plugin overlap.", cachePlugins.map((plugin) => plugin.name), ["wordpress", "cms", "audit"]));
    for (const plugin of active.filter((plugin) => plugin.type === "builder"))
        issues.push(issue("wordpress-page-builder-performance-review", "wordpress-theme-performance", "P3", "Active page builder plugin needs performance review", "Review builder templates for bloat and SEO metadata output.", [plugin.name], ["wordpress", "cms", "audit"]));
    return issues;
}
function checkReact(input, framework) {
    if (framework !== "react" && input.mode !== "react")
        return [];
    const issues = [];
    for (const route of input.routes ?? []) {
        const publicRoute = !/\/(admin|dashboard|login|account)(\/|$)/iu.test(route.path) && route.isIndexable !== false;
        if (publicRoute && route.rendering === "csr")
            issues.push(issue("react-csr-public-route", "react-seo", "P2", "Public SEO route is client-side rendered", "Use SSR, SSG, or pre-rendering for important public routes.", [route.path], ["react", "framework", "audit"]));
        if (route.path.includes("#"))
            issues.push(issue("react-hash-route", "spa-seo-risk", "P2", "Hash route detected", "Use crawlable path-based URLs for public SEO pages.", [route.path], ["react", "framework", "audit"]));
    }
    if (input.html && isEmptyRoot(input.html, stripTags(input.html)))
        issues.push(issue("react-empty-root-div", "spa-seo-risk", "P2", "HTML appears to contain an empty root app shell", "Ensure SEO-critical content is present in initial HTML.", ["root app shell"], ["react", "framework", "audit"]));
    if (input.html && /<button[^>]*>[^<]*(home|about|services|products)[^<]*<\/button>/iu.test(input.html))
        issues.push(issue("react-button-only-navigation", "react-seo", "P2", "Button-only navigation evidence found", "Use real anchor links for crawlable navigation.", ["button navigation"], ["react", "framework", "audit"]));
    return issues;
}
function checkNext(input, framework) {
    if (framework !== "nextjs" && input.mode !== "nextjs")
        return [];
    const issues = [];
    if (input.build?.generatedSitemap === false)
        issues.push(issue("nextjs-missing-generated-sitemap", "sitemap-generation", "P2", "Next.js build did not generate sitemap", "Generate sitemap from canonical indexable routes.", ["generatedSitemap false"], ["nextjs", "build", "audit"]));
    if (input.build?.generatedRobotsTxt === false)
        issues.push(issue("nextjs-missing-generated-robots", "robots-generation", "P2", "Next.js build did not generate robots.txt", "Generate robots.txt intentionally and include sitemap URL.", ["generatedRobotsTxt false"], ["nextjs", "build", "audit"]));
    for (const route of input.routes ?? []) {
        const dynamic = /\[.+\]|:\w+/u.test(route.path);
        if (dynamic && (!route.title || !route.metaDescription || !route.canonicalUrl))
            issues.push(issue("nextjs-dynamic-route-missing-metadata", "dynamic-metadata", "P2", "Dynamic route missing metadata", "Generate title, description, and canonical for dynamic routes.", [route.path], ["nextjs", "framework", "audit"]));
        if (route.rendering === "csr" && route.isIndexable !== false)
            issues.push(issue("nextjs-public-client-only-route", "ssr-ssg-readiness", "P2", "Public Next.js route is client-only", "Use SSR, SSG, or ISR intentionally for SEO routes.", [route.path], ["nextjs", "framework", "audit"]));
    }
    return issues;
}
function checkStatic(input, framework) {
    if (framework !== "static" && input.mode !== "static")
        return [];
    const issues = [];
    if (!input.seoFiles?.sitemapXml && input.build?.generatedSitemap !== true)
        issues.push(issue("static-missing-sitemap", "sitemap-generation", "P2", "Static site missing sitemap input", "Generate a sitemap for canonical indexable pages.", ["sitemap missing"], ["static", "audit"]));
    if (!input.seoFiles?.robotsTxt && input.build?.generatedRobotsTxt !== true)
        issues.push(issue("static-missing-robots", "robots-generation", "P3", "Static site missing robots.txt input", "Generate robots.txt intentionally.", ["robots missing"], ["static", "audit"]));
    if (input.html) {
        if (!/<title[^>]*>[\s\S]+<\/title>/iu.test(input.html))
            issues.push(issue("static-html-missing-title", "metadata", "P1", "Static HTML missing title", "Add a unique title.", ["html"], ["static", "audit"]));
        if (!/<meta[^>]+name=["']description["']/iu.test(input.html))
            issues.push(issue("static-html-missing-meta-description", "metadata", "P2", "Static HTML missing meta description", "Add a useful meta description.", ["html"], ["static", "audit"]));
        if (!/<link[^>]+rel=["']canonical["']/iu.test(input.html))
            issues.push(issue("static-html-missing-canonical", "canonical-generation", "P2", "Static HTML missing canonical", "Add canonical URL.", ["html"], ["static", "audit"]));
    }
    if (input.html && /href=["']\.\.\/\.\.\//iu.test(input.html))
        issues.push(issue("static-broken-relative-link-risk", "static-seo", "P3", "Suspicious deep relative link pattern", "Review relative links in static output.", ["../../"], ["static", "audit"]));
    return issues;
}
function checkSeoFiles(input) {
    const issues = [];
    const routes = input.routes ?? [];
    const sitemap = input.seoFiles?.sitemapXml ?? "";
    const robots = input.seoFiles?.robotsTxt ?? "";
    for (const route of routes.filter((route) => route.isIndexable === false || /\/(admin|dashboard|login|account|checkout|cart)(\/|$)/iu.test(route.path))) {
        if (sitemap.includes(route.path))
            issues.push(issue("sitemap-includes-private-noindex-route", "sitemap-generation", "P2", "Sitemap includes private/noindex route", "Exclude private, noindex, redirected, and error routes from sitemap.", [route.path], ["framework", "audit"]));
    }
    for (const route of routes.filter((route) => route.isIndexable !== false && !/\/(admin|dashboard|login|account|checkout|cart)(\/|$)/iu.test(route.path))) {
        if (robots && new RegExp(`Disallow:\\s*${escapeRegex(route.path)}`, "iu").test(robots))
            issues.push(issue("robots-blocks-important-public-route", "robots-generation", "P1", "Robots.txt blocks important public route", "Do not block public SEO routes in robots.txt.", [route.path], ["framework", "audit"]));
    }
    return issues;
}
function checkBuild(input) {
    const issues = [];
    if (input.build?.status === "failed")
        issues.push(issue("framework-build-failed", "build-seo", "P0", "Framework build failed", "Fix build errors before deployment.", input.build.errors?.length ? input.build.errors : ["build failed"], ["build", "audit"]));
    for (const error of input.build?.errors ?? [])
        issues.push(issue("framework-build-error", "build-seo", "P1", "Build error provided", "Fix build errors before deployment.", [error], ["build", "audit"]));
    for (const warning of input.build?.warnings ?? [])
        if (/\b(metadata|route|sitemap|robots|hydration|canonical|seo)\b/iu.test(warning))
            issues.push(issue("framework-build-seo-warning", "build-seo", "P2", "Build warning may affect SEO", "Review SEO-related build warnings.", [warning], ["build", "audit"]));
    if (input.build && !input.build.outputDir)
        issues.push(issue("framework-build-output-dir-missing", "build-seo", "P3", "Build output directory not provided", "Verify production build output directory.", ["outputDir missing"], ["build", "audit"]));
    const generated = new Set(input.build?.generatedStaticRoutes ?? []);
    for (const route of (input.routes ?? []).filter((route) => ["homepage", "service", "product", "landing", "pricing"].includes(route.pageType ?? ""))) {
        if (input.build?.generatedStaticRoutes && !generated.has(route.path))
            issues.push(issue("important-route-missing-from-static-build", "build-seo", "P2", "Important route missing from generated static routes", "Ensure important public routes are generated.", [route.path], ["build", "audit"]));
    }
    return issues;
}
function hasInput(input) {
    return Boolean(input.html || input.framework || input.cms || input.packageJson || input.frameworkConfig || input.routes?.length || input.build || input.seoFiles);
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.html)
        missing.push("html");
    if (!input.framework && !input.cms && !input.packageJson)
        missing.push("framework, cms, or packageJson");
    if (!input.routes?.length)
        missing.push("routes");
    if (!input.build)
        missing.push("build");
    if (!input.seoFiles)
        missing.push("seoFiles");
    return missing;
}
export function needsInput() {
    return { skill: "cms-framework-seo", status: "needs_input", score: 0, summary: "Needs input. Provide HTML, framework, CMS settings, package.json, route data, build data, or SEO files.", frameworkFindings: [], wordpressFindings: [], reactFindings: [], nextjsFindings: [], staticFindings: [], buildFindings: [], issues: [], missingInputs: ["html", "framework", "cms", "packageJson", "frameworkConfig", "routes", "build", "seoFiles"], nextActions: ["Provide explicit CMS/framework inputs.", "No live build, CMS login, plugin scan, or crawl was performed."] };
}
export function issue(id, category, priority, title, howToFix, evidence, appliesTo) {
    return { id, category, title, priority, problem: evidence.join("; "), whyItMatters: "CMS and framework SEO depends on reliable initial HTML, route metadata, build output, sitemap/robots generation, and platform-specific configuration. No live inspection was performed.", howToFix, do: ["Use explicit provided configuration and build evidence", "Keep route-level SEO metadata reliable", "Validate CMS/framework behavior before launch"], dont: ["Invent framework version, plugin status, build result, route behavior, or deployment status", "Assume framework defaults are SEO-safe", "Rely on delayed client rendering for critical SEO content"], evidence, appliesTo };
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
function isEmptyRoot(html, text) {
    return /<div[^>]+id=["']root["'][^>]*>\s*<\/div>/iu.test(html) || /<div[^>]+id=["']app["'][^>]*>\s*<\/div>/iu.test(html) || text.split(/\s+/u).filter(Boolean).length < 20 && /id=["']root["']|id=["']app["']/iu.test(html);
}
function stripTags(value) {
    return value.replace(/<script[\s\S]*?<\/script>/giu, " ").replace(/<style[\s\S]*?<\/style>/giu, " ").replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
//# sourceMappingURL=framework-seo-audit.js.map