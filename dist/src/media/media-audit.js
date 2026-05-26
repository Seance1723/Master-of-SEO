export function runMediaAudit(input) {
    const normalized = normalizeInput(input);
    if (!hasInput(normalized))
        return needsInput();
    const images = normalized.images ?? [];
    const videos = normalized.videos ?? [];
    const schemas = normalized.schema?.jsonLd ?? [];
    const issues = [
        ...checkImages(images),
        ...checkOpenGraph(normalized),
        ...checkVideos(videos, normalized),
        ...checkVideoSchema(schemas, videos),
        ...checkAssets(normalized)
    ];
    const missingInputs = getMissingInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "media-seo",
        status,
        score: score(issues),
        summary: `${status === "partial" ? "Partial media SEO audit completed" : "Media SEO audit completed"}. Reviewed ${images.length} image(s), ${videos.length} video(s), and found ${issues.length} issue(s).`,
        imageFindings: [`Images reviewed: ${images.length}`],
        videoFindings: [`Videos reviewed: ${videos.length}`],
        accessibilityFindings: issues.filter((issue) => issue.appliesTo.includes("accessibility")).map((issue) => issue.title),
        performanceFindings: issues.filter((issue) => issue.appliesTo.includes("performance")).map((issue) => issue.title),
        schemaFindings: [`JSON-LD objects reviewed: ${schemas.length}`],
        issues,
        missingInputs,
        nextActions: issues.length ? ["Fix P1/P2 media accessibility and performance issues first.", "Provide explicit media metadata for deeper checks."] : ["Keep media metadata accurate and validate before publishing."]
    };
}
export function parseMediaAuditInputFromText(rawInput) {
    const mode = rawInput.includes("image-seo-audit") ? "image" : rawInput.includes("video-seo-audit") ? "video" : "audit";
    const input = { mode };
    const args = rawInput.replace(/^\/seo-master\s+(?:media-audit|image-seo-audit|video-seo-audit)\s*/u, "").trim();
    const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
    for (const match of args.matchAll(flagPattern)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "url")
            input.url = value;
        if (key === "html")
            input.html = value;
        if (key === "page")
            input.page = parseJsonFlag(value, undefined);
        if (key === "images")
            input.images = parseJsonFlag(value, []);
        if (key === "videos")
            input.videos = parseJsonFlag(value, []);
        if (key === "openGraph" || key === "open-graph")
            input.openGraph = parseJsonFlag(value, undefined);
        if (key === "schema")
            input.schema = parseJsonFlag(value, undefined);
        if (key === "assets")
            input.assets = parseJsonFlag(value, []);
        if (key === "mode" && ["audit", "image", "video", "planning"].includes(value))
            input.mode = value;
    }
    return input;
}
function normalizeInput(input) {
    const extracted = extractFromHtml(input.html);
    return {
        ...input,
        mode: input.mode ?? "audit",
        images: input.images?.length ? input.images : extracted.images,
        videos: input.videos?.length ? input.videos : extracted.videos,
        openGraph: input.openGraph ?? (hasOpenGraph(extracted.openGraph) ? extracted.openGraph : undefined),
        schema: input.schema ?? ((extracted.schema.jsonLd ?? []).length ? extracted.schema : undefined)
    };
}
function extractFromHtml(html = "") {
    const images = [];
    const videos = [];
    const schema = { jsonLd: [] };
    for (const match of html.matchAll(/<img\b[^>]*>/giu)) {
        const tag = match[0];
        images.push({
            src: attr(tag, "src") ?? "",
            alt: attr(tag, "alt"),
            width: num(attr(tag, "width")),
            height: num(attr(tag, "height")),
            loading: asLoading(attr(tag, "loading")),
            hasSrcset: Boolean(attr(tag, "srcset")),
            hasSizes: Boolean(attr(tag, "sizes")),
            filename: filename(attr(tag, "src") ?? ""),
            format: format(attr(tag, "src") ?? "")
        });
    }
    for (const match of html.matchAll(/<video\b[^>]*>([\s\S]*?)<\/video>|<video\b[^>]*\/?>/giu)) {
        const tag = match[0];
        videos.push({ src: attr(tag, "src"), thumbnailUrl: attr(tag, "poster"), hasCaptions: /<track\b[^>]+kind=["']captions["']/iu.test(tag), position: /above[-_ ]fold/iu.test(tag) ? "above_fold" : "unknown" });
    }
    for (const match of html.matchAll(/<iframe\b[^>]*>/giu)) {
        const src = attr(match[0], "src");
        if (src && /(youtube|youtu\.be|vimeo|wistia|loom)/iu.test(src))
            videos.push({ embedUrl: src });
    }
    const openGraph = {
        ogImage: meta(html, "property", "og:image"),
        ogImageAlt: meta(html, "property", "og:image:alt"),
        twitterImage: meta(html, "name", "twitter:image"),
        twitterImageAlt: meta(html, "name", "twitter:image:alt")
    };
    for (const block of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)) {
        try {
            const parsed = JSON.parse(block[1]?.trim() ?? "");
            schema.jsonLd.push(...(Array.isArray(parsed) ? parsed : [parsed]));
        }
        catch {
            // Schema validation belongs to Group 8; Media SEO only uses parseable media schema.
        }
    }
    return { images: images.filter((image) => image.src), videos, openGraph, schema };
}
function checkImages(images) {
    const issues = [];
    const altCounts = new Map();
    for (const image of images) {
        const alt = image.alt?.trim() ?? "";
        if (alt)
            altCounts.set(alt.toLowerCase(), (altCounts.get(alt.toLowerCase()) ?? 0) + 1);
        if (!image.isDecorative && !alt)
            issues.push(issue("image-missing-alt", "image-alt", image.isHero || image.position === "above_fold" ? "P2" : "P3", "Image missing alt text", image.src, ["image", "accessibility"]));
        if (alt && isKeywordStuffed(alt))
            issues.push(issue("image-alt-keyword-stuffing", "image-alt", "P2", "Image alt text appears keyword-stuffed", alt, ["image", "accessibility"]));
        const name = image.filename ?? filename(image.src);
        if (/^(img|dsc)[-_]?\d+|screenshot[-_]?final[-_]?final/iu.test(name))
            issues.push(issue("image-random-filename", "image-filename", "P3", "Image filename looks random or unhelpful", name, ["image"]));
        if (name.includes("_"))
            issues.push(issue("image-filename-underscore", "image-filename", "P3", "Image filename uses underscores", name, ["image"]));
        if ((image.sizeKb ?? 0) > 1000)
            issues.push(issue("image-very-large", "image-format-compression", "P1", "Very large image asset", `${image.src} ${image.sizeKb}KB`, ["image", "performance"]));
        else if ((image.sizeKb ?? 0) > 300)
            issues.push(issue("image-large", "image-format-compression", "P2", "Large image asset", `${image.src} ${image.sizeKb}KB`, ["image", "performance"]));
        if (["jpg", "jpeg", "png"].includes(image.format ?? format(image.src) ?? ""))
            issues.push(issue("image-non-modern-format", "image-format-compression", "P2", "Photographic image may use non-modern format", image.src, ["image", "performance"]));
        if (!image.width || !image.height)
            issues.push(issue("image-missing-dimensions", "responsive-images", image.isHero || image.position === "above_fold" ? "P2" : "P3", "Image missing width or height", image.src, ["image", "performance"]));
        if (image.isHero && image.loading === "lazy")
            issues.push(issue("hero-image-lazy-loaded", "media-performance-guard", "P1", "Hero image is lazy-loaded", image.src, ["image", "performance"]));
        if ((image.sizeKb ?? 0) > 300 && (!image.hasSrcset || !image.hasSizes))
            issues.push(issue("image-missing-responsive-attrs", "responsive-images", "P2", "Large image missing srcset or sizes", image.src, ["image", "performance"]));
    }
    for (const [alt, count] of altCounts.entries())
        if (count > 2)
            issues.push(issue("image-duplicate-alt", "image-alt", "P3", "Duplicate alt text appears across many images", alt, ["image", "accessibility"]));
    return issues;
}
function checkOpenGraph(input) {
    const issues = [];
    const shareable = ["homepage", "article", "blog", "product", "service", "landing"].includes(input.page?.pageType ?? "");
    if (shareable && !input.openGraph?.ogImage)
        issues.push(issue("missing-og-image", "open-graph-image", input.page?.pageType === "homepage" ? "P2" : "P3", "Shareable page missing og:image", input.page?.pageType ?? "page", ["media"]));
    if (input.openGraph?.ogImage && !input.openGraph.ogImageAlt)
        issues.push(issue("missing-og-image-alt", "open-graph-image", "P3", "Open Graph image missing alt", input.openGraph.ogImage, ["media", "accessibility"]));
    if (input.openGraph?.ogImage && !input.openGraph.twitterImage)
        issues.push(issue("missing-twitter-image", "open-graph-image", "P3", "twitter:image missing while og:image exists", input.openGraph.ogImage, ["media"]));
    return issues;
}
function checkVideos(videos, input) {
    const issues = [];
    for (const video of videos) {
        const source = video.src ?? video.embedUrl ?? video.title ?? "video";
        if (!video.title)
            issues.push(issue("video-missing-title", "video-seo", "P2", "Video missing title", source, ["video"]));
        if (!video.description)
            issues.push(issue("video-missing-description", "video-seo", "P3", "Video missing description", source, ["video"]));
        if (!video.thumbnailUrl)
            issues.push(issue("video-missing-thumbnail", "video-thumbnail", "P2", "Video missing thumbnail", source, ["video"]));
        if (video.hasTranscript === false)
            issues.push(issue("video-missing-transcript", "video-transcript-caption", "P2", "Video missing transcript", source, ["video", "accessibility"]));
        if (video.hasCaptions === false)
            issues.push(issue("video-missing-captions", "video-transcript-caption", "P2", "Video missing captions", source, ["video", "accessibility"]));
        if (video.position === "above_fold")
            issues.push(issue("above-fold-video-performance-review", "media-performance-guard", "P2", "Above-fold video/embed needs performance review", source, ["video", "performance"]));
    }
    if ((input.page?.pageType === "video" || videos.length) && !input.page?.visibleContent && !videos.some((video) => video.hasTranscript))
        issues.push(issue("video-page-no-text-context", "video-seo", "P2", "Video page has no provided text context or transcript", input.page?.url ?? input.url ?? "video page", ["video", "accessibility"]));
    if (/<video\b[^>]*autoplay[^>]*(?!muted)|<video\b(?=[^>]*autoplay)(?=[^>]*sound)/iu.test(input.html ?? ""))
        issues.push(issue("autoplay-video-with-sound", "media-accessibility", "P1", "Autoplay video with sound is detectable", "autoplay video", ["video", "accessibility", "performance"]));
    if (videos.length > 3)
        issues.push(issue("many-video-embeds", "media-performance-guard", "P3", "Many video embeds provided", `${videos.length} videos`, ["video", "performance"]));
    return issues;
}
function checkVideoSchema(schemas, videos) {
    const issues = [];
    const videoSchemas = schemas.filter((schema) => schema["@type"] === "VideoObject");
    if (videos.length && !videoSchemas.length)
        issues.push(issue("visible-video-missing-videoobject", "video-schema-support", "P2", "Visible/provided video has no VideoObject schema", `${videos.length} video(s)`, ["video"]));
    for (const schema of videoSchemas) {
        if (!videos.length)
            issues.push(issue("videoobject-without-visible-video", "video-schema-support", "P1", "VideoObject provided without visible/provided video evidence", JSON.stringify(schema).slice(0, 120), ["video"]));
        if (!schema.name)
            issues.push(issue("videoobject-missing-name", "video-schema-support", "P2", "VideoObject missing name", JSON.stringify(schema).slice(0, 120), ["video"]));
        if (!schema.thumbnailUrl)
            issues.push(issue("videoobject-missing-thumbnail", "video-schema-support", "P2", "VideoObject missing thumbnailUrl", JSON.stringify(schema).slice(0, 120), ["video"]));
        if (!schema.uploadDate)
            issues.push(issue("videoobject-missing-upload-date", "video-schema-support", "P3", "VideoObject missing uploadDate", JSON.stringify(schema).slice(0, 120), ["video"]));
    }
    return issues;
}
function checkAssets(input) {
    return (input.assets ?? []).flatMap((asset) => {
        if (asset.type === "image" && (asset.sizeKb ?? 0) > 1000)
            return [issue("image-asset-very-large", "media-performance-guard", "P1", "Very large image asset", `${asset.url} ${asset.sizeKb}KB`, ["image", "performance"])];
        if (asset.type === "video" && (asset.sizeKb ?? 0) > 5000)
            return [issue("video-asset-large", "media-performance-guard", "P2", "Large video asset", `${asset.url} ${asset.sizeKb}KB`, ["video", "performance"])];
        return [];
    });
}
function needsInput() {
    return { skill: "media-seo", status: "needs_input", score: 0, summary: "Needs input. Provide HTML, image data, video data, Open Graph data, schema, or media assets.", imageFindings: [], videoFindings: [], accessibilityFindings: [], performanceFindings: [], schemaFindings: [], issues: [], missingInputs: ["html", "images", "videos", "openGraph", "schema", "assets"], nextActions: ["Provide explicit HTML, images, videos, Open Graph, schema, or media assets.", "No live crawling, fetching, OCR, or external media validation was performed."] };
}
function hasInput(input) {
    return Boolean(input.html || input.images?.length || input.videos?.length || hasOpenGraph(input.openGraph) || input.schema?.jsonLd?.length || input.assets?.length);
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.html)
        missing.push("html");
    if (!input.images?.length)
        missing.push("images");
    if (!input.videos?.length)
        missing.push("videos");
    if (!hasOpenGraph(input.openGraph))
        missing.push("openGraph");
    if (!input.schema?.jsonLd?.length)
        missing.push("schema");
    if (!input.assets?.length)
        missing.push("assets");
    return missing;
}
function issue(id, category, priority, title, evidence, appliesTo) {
    return {
        id,
        category,
        title,
        priority,
        problem: evidence,
        whyItMatters: "Media affects search understanding, accessibility, sharing quality, and page performance.",
        howToFix: "Update media metadata and markup from provided, visible, accurate content only.",
        do: ["Use meaningful media", "Provide accessible text alternatives", "Compress and size media correctly"],
        dont: ["Invent media metadata", "Keyword-stuff alt text", "Lazy-load hero media"],
        evidence: [evidence],
        appliesTo: ["media", "audit", ...appliesTo.filter((item) => item !== "media")]
    };
}
function attr(tag, name) {
    return tag.match(new RegExp(`${name}=["']([^"']*)["']`, "iu"))?.[1];
}
function meta(html, key, name) {
    const pattern = new RegExp(`<meta[^>]+${key}=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, "iu");
    return html.match(pattern)?.[1];
}
function filename(src) {
    return src.split("?")[0]?.split("/").pop() ?? src;
}
function format(src) {
    const ext = filename(src).split(".").pop()?.toLowerCase();
    return ext && ["jpg", "jpeg", "png", "webp", "avif", "svg", "gif"].includes(ext) ? ext : "unknown";
}
function num(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function asLoading(value) {
    return value === "lazy" || value === "eager" ? value : value ? "unknown" : undefined;
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value.replace(/\\"/gu, "\""));
    }
    catch {
        return fallback;
    }
}
function isKeywordStuffed(text) {
    const words = text.toLowerCase().split(/\s+/u).filter(Boolean);
    return words.length > 8 && new Set(words).size <= Math.ceil(words.length / 2);
}
function score(issues) {
    return Math.max(0, 100 - issues.reduce((sum, item) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[item.priority]), 0));
}
function hasOpenGraph(openGraph) {
    return Boolean(openGraph?.ogImage || openGraph?.ogImageAlt || openGraph?.twitterImage || openGraph?.twitterImageAlt);
}
//# sourceMappingURL=media-audit.js.map