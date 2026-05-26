export function runEcommerceAudit(input) {
    const normalized = normalizeInput({ ...input, mode: input.mode ?? "audit" });
    if (!hasInput(normalized))
        return needsInput();
    const issues = [
        ...checkPage(normalized),
        ...checkCategories(normalized),
        ...checkProducts(normalized),
        ...checkVariants(normalized),
        ...checkFilters(normalized),
        ...checkPagination(normalized),
        ...checkPolicies(normalized),
        ...checkMerchantFeed(normalized),
        ...checkInternalLinks(normalized)
    ];
    const missingInputs = getMissingInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "ecommerce-seo",
        status,
        score: score(issues),
        summary: `${status === "partial" ? "Partial ecommerce SEO audit completed" : "Ecommerce SEO audit completed"}. Reviewed ${normalized.categories?.length ?? 0} category page(s), ${normalized.products?.length ?? 0} product page(s), and found ${issues.length} issue(s).`,
        categoryFindings: [`Categories reviewed: ${normalized.categories?.length ?? 0}`],
        productFindings: [`Products reviewed: ${normalized.products?.length ?? 0}`],
        variantFindings: [`Products with variants reviewed: ${(normalized.products ?? []).filter((product) => product.variants?.length).length}`],
        facetedNavigationFindings: [`Filters reviewed: ${normalized.filters?.length ?? 0}`],
        paginationFindings: [`Pagination URLs reviewed: ${normalized.pagination?.length ?? 0}`],
        trustFindings: normalized.policies ? ["Trust policy inputs reviewed."] : [],
        merchantFeedFindings: normalized.merchantFeed ? ["Merchant feed readiness inputs reviewed."] : [],
        issues,
        missingInputs,
        nextActions: issues.length ? ["Fix P1/P2 ecommerce issues first.", "Provide explicit product, category, policy, feed, and link data for deeper checks."] : ["Keep ecommerce data accurate and visible before adding schema/feed integrations."]
    };
}
export function parseEcommerceAuditInputFromText(rawInput) {
    const mode = rawInput.includes("product-seo-audit") ? "product" : rawInput.includes("category-seo-audit") ? "category" : "audit";
    const input = { mode };
    const args = rawInput.replace(/^\/seo-master\s+(?:ecommerce-seo|ecommerce-audit|product-seo-audit|category-seo-audit)\s*/u, "").trim();
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
        if (key === "categories")
            input.categories = parseJsonFlag(value, []);
        if (key === "products")
            input.products = parseJsonFlag(value, []);
        if (key === "filters")
            input.filters = parseJsonFlag(value, []);
        if (key === "pagination")
            input.pagination = parseJsonFlag(value, []);
        if (key === "policies")
            input.policies = parseJsonFlag(value, undefined);
        if (key === "merchantFeed" || key === "merchant-feed")
            input.merchantFeed = parseJsonFlag(value, undefined);
        if (key === "internalLinks" || key === "internal-links")
            input.internalLinks = parseJsonFlag(value, []);
        if (key === "mode" && ["audit", "category", "product", "variants", "faceted", "planning"].includes(value))
            input.mode = value;
    }
    return input;
}
function normalizeInput(input) {
    if (input.html && !input.page) {
        const title = input.html.match(/<title[^>]*>(.*?)<\/title>/isu)?.[1]?.trim();
        const h1 = input.html.match(/<h1[^>]*>(.*?)<\/h1>/isu)?.[1]?.replace(/<[^>]+>/gu, "").trim();
        input.page = { title, h1, pageType: /cart|checkout|account|wishlist/iu.test(input.html) ? "unknown" : undefined };
    }
    return input;
}
function checkPage(input) {
    const issues = [];
    const page = input.page;
    if (!page)
        return issues;
    const blockedPage = ["cart", "checkout", "account", "wishlist", "search"].includes(page.pageType ?? "");
    const indexable = !/noindex/iu.test(page.robots ?? "");
    if (blockedPage && indexable)
        issues.push(issue("private-commerce-page-indexable", "ecommerce-page", "P1", `${page.pageType} page appears indexable`, "Noindex cart, checkout, account, wishlist, and internal search pages.", [page.url ?? page.pageType ?? "page"], ["ecommerce", "audit"]));
    if (["product", "category", "collection"].includes(page.pageType ?? "")) {
        if (!page.title)
            issues.push(issue("commerce-page-missing-title", "ecommerce-page", "P2", "Product/category page missing title", "Add a clear unique title.", [page.url ?? "page"], ["ecommerce", "audit"]));
        if (!page.h1)
            issues.push(issue("commerce-page-missing-h1", "ecommerce-page", "P2", "Product/category page missing H1", "Add a clear visible H1.", [page.url ?? "page"], ["ecommerce", "audit"]));
        if (page.url && !page.canonicalUrl)
            issues.push(issue("commerce-page-missing-canonical", "ecommerce-page", "P2", "Product/category page missing canonical", "Add a self-canonical or accurate canonical URL.", [page.url], ["ecommerce", "audit"]));
    }
    return issues;
}
function checkCategories(input) {
    const issues = [];
    for (const category of input.categories ?? []) {
        if (category.productCount === 0 && category.isIndexable)
            issues.push(issue("empty-indexable-category", "category-seo", "P1", "Empty category is indexable", "Noindex, improve, merge, or remove empty categories.", [category.url], ["category", "audit"]));
        if (!category.description && !category.bodyText)
            issues.push(issue("category-missing-description", "category-seo", "P2", "Category missing description/body copy", "Add unique helpful category copy.", [category.url], ["category", "audit"]));
        if ((category.description?.length ?? category.bodyText?.length ?? 0) > 0 && (category.description?.length ?? category.bodyText?.length ?? 0) < 80)
            issues.push(issue("category-thin-copy", "category-content-quality", "P3", "Category copy is very thin", "Expand category copy with useful buying guidance.", [category.url], ["category", "audit"]));
        if ((category.productCount ?? 0) > 100 && !category.filters?.length)
            issues.push(issue("large-category-no-filters", "category-seo", "P3", "Large category has no provided filters", "Consider useful crawl-safe filters for users.", [category.url], ["category", "audit"]));
        if (category.filters?.length && category.isIndexable && !category.filters.some(Boolean))
            issues.push(issue("category-indexable-empty-filters", "faceted-navigation", "P2", "Indexable category has unclear filter strategy", "Define valuable filter combinations and suppress low-value ones.", [category.url], ["category", "faceted_navigation", "audit"]));
        if (category.pagination && category.pagination.totalPages && category.pagination.totalPages > 1 && category.pagination.hasCrawlableLinks === false)
            issues.push(issue("category-pagination-not-crawlable", "pagination-seo", "P2", "Category pagination lacks crawlable links", "Add crawlable pagination links or fallback.", [category.url], ["category", "pagination", "audit"]));
    }
    return issues;
}
function checkProducts(input) {
    const issues = [];
    for (const product of input.products ?? []) {
        if (!product.name)
            issues.push(issue("product-missing-name", "product-seo", "P1", "Product missing name", "Add the real product name.", [product.url], ["product", "audit"]));
        if (!product.description)
            issues.push(issue("product-missing-description", "product-seo", "P2", "Product missing description", "Add a unique product description.", [product.url], ["product", "audit"]));
        else if (product.description.length < 80)
            issues.push(issue("product-thin-description", "product-seo", "P2", "Product description is thin", "Expand with useful product details.", [product.url], ["product", "audit"]));
        if (!product.images?.length)
            issues.push(issue("product-missing-images", "product-seo", "P2", "Product missing images", "Add accurate product images.", [product.url], ["product", "audit"]));
        if (product.price === undefined)
            issues.push(issue("product-missing-price", "product-seo", "P2", "Product missing price", "Provide visible price when available; do not invent it.", [product.url], ["product", "audit"]));
        if (!product.availability || product.availability === "unknown")
            issues.push(issue("product-missing-availability", "product-seo", "P2", "Product missing availability", "Provide accurate availability when available; do not invent stock status.", [product.url], ["product", "audit"]));
        if (!product.brand)
            issues.push(issue("product-missing-brand", "product-seo", "P3", "Product missing brand", "Add brand when provided.", [product.url], ["product", "audit"]));
        if (!product.sku)
            issues.push(issue("product-missing-sku", "product-seo", "P3", "Product missing SKU", "Add SKU when provided.", [product.url], ["product", "audit"]));
        if (product.availability === "out_of_stock")
            issues.push(issue("product-out-of-stock-handling", "stock-discontinued", "P3", "Product is out of stock", "Keep the page live if returning, show alternatives, and use accurate availability.", [product.url], ["product", "audit"]));
        if (product.availability === "discontinued")
            issues.push(issue("product-discontinued-handling", "stock-discontinued", "P2", "Product is discontinued", "Redirect to closest alternative, noindex, or 410 when appropriate.", [product.url], ["product", "audit"]));
        if (product.aggregateRating && !product.reviews?.length)
            issues.push(issue("aggregate-rating-without-reviews", "review-rating-guard", "P1", "aggregateRating exists without provided reviews", "Use ratings only with genuine visible reviews.", [product.url], ["product", "audit"]));
        if (product.aggregateRating?.reviewCount !== undefined && product.reviews && product.aggregateRating.reviewCount !== product.reviews.length)
            issues.push(issue("review-count-mismatch", "review-rating-guard", "P2", "Review count mismatches provided reviews", "Keep review count accurate.", [product.url], ["product", "audit"]));
        for (const review of product.reviews ?? [])
            if (review.rating !== undefined && (review.rating < 1 || review.rating > 5))
                issues.push(issue("review-rating-out-of-range", "review-rating-guard", "P2", "Review rating outside 1-5", "Use only valid genuine review ratings.", [product.url], ["product", "audit"]));
        if (product.schema)
            checkProductSchema(product, issues);
    }
    return issues;
}
function checkProductSchema(product, issues) {
    if (product.schema?.["@type"] && product.schema["@type"] !== "Product")
        issues.push(issue("product-schema-wrong-type", "product-schema-guard", "P2", "Product schema @type is not Product", "Use Product schema only for product pages.", [product.url], ["product", "audit"]));
    const offers = product.schema?.offers;
    if (offers && typeof offers === "object") {
        const offer = offers;
        if (offer.price === undefined || offer.availability === undefined)
            issues.push(issue("product-schema-offers-incomplete", "product-schema-guard", "P2", "Product schema offers missing price/availability", "Include offers only when price and availability are accurate.", [product.url], ["product", "audit"]));
        if (product.price !== undefined && offer.price !== undefined && Number(offer.price) !== product.price)
            issues.push(issue("product-schema-price-conflict", "product-schema-guard", "P1", "Product schema price conflicts with provided product price", "Align schema with visible product price.", [product.url], ["product", "audit"]));
        if (product.availability && offer.availability && !String(offer.availability).toLowerCase().includes(product.availability.replace(/_/gu, "").toLowerCase()))
            issues.push(issue("product-schema-availability-conflict", "product-schema-guard", "P1", "Product schema availability conflicts with provided availability", "Align schema with visible stock status.", [product.url], ["product", "audit"]));
    }
}
function checkVariants(input) {
    const issues = [];
    for (const product of input.products ?? []) {
        const variants = product.variants ?? [];
        if (variants.length > 1 && variants.some((variant) => variant.url) && variants.some((variant) => !variant.canonicalUrl))
            issues.push(issue("variant-group-missing-canonical-strategy", "product-variants", "P2", "Variant group lacks canonical strategy", "Canonical duplicate variants to the main product or index only unique variants.", [product.url], ["product", "audit"]));
        const urls = variants.map((variant) => variant.url).filter(Boolean);
        if (new Set(urls).size !== urls.length)
            issues.push(issue("duplicate-variant-url", "product-variants", "P2", "Duplicate variant URLs found", "Keep unique variant URLs or consolidate.", [product.url], ["product", "audit"]));
        for (const variant of variants)
            if (variant.canonicalUrl && product.url && ![product.url, variant.url].includes(variant.canonicalUrl))
                issues.push(issue("variant-canonical-unrelated", "product-variants", "P2", "Variant canonical may point to unrelated URL", "Canonical variants only to the relevant main product or self.", [variant.url ?? product.url], ["product", "audit"]));
    }
    return issues;
}
function checkFilters(input) {
    const issues = [];
    for (const filter of input.filters ?? []) {
        const parameter = filter.parameter ?? filter.url;
        if (filter.isIndexable && !filter.hasSearchDemand)
            issues.push(issue("indexable-filter-no-demand", "faceted-navigation", "P2", "Filter URL is indexable without search demand", "Index only valuable filter combinations.", [filter.url], ["faceted_navigation", "audit"]));
        if (filter.isIndexable && /(sort|order|view|session|sid|utm_)/iu.test(parameter))
            issues.push(issue("indexable-low-value-parameter", "filter-parameter-seo", "P1", "Sort/order/session parameter is indexable", "Noindex, canonicalize, or block low-value parameters carefully.", [filter.url], ["faceted_navigation", "audit"]));
        if (filter.isIndexable && filter.productCount === 0)
            issues.push(issue("empty-indexable-filter", "faceted-navigation", "P1", "Empty filter URL is indexable", "Noindex or remove empty filter pages.", [filter.url], ["faceted_navigation", "audit"]));
        if (!filter.canonicalUrl)
            issues.push(issue("filter-missing-canonical", "filter-parameter-seo", "P2", "Filter URL missing canonical", "Define canonical behavior for filter URLs.", [filter.url], ["faceted_navigation", "audit"]));
    }
    if ((input.filters?.length ?? 0) > Math.max(20, ((input.categories?.length ?? 0) + (input.products?.length ?? 0)) * 5))
        issues.push(issue("too-many-filter-urls", "faceted-navigation", "P2", "Many filter URLs compared with provided catalog size", "Limit crawlable filter combinations.", [String(input.filters?.length ?? 0)], ["faceted_navigation", "audit"]));
    return issues;
}
function checkPagination(input) {
    const issues = [];
    for (const page of input.pagination ?? []) {
        if (page.hasCrawlableNextPrev === false)
            issues.push(issue("pagination-not-crawlable", "pagination-seo", "P2", "Pagination lacks crawlable next/prev links", "Provide crawlable pagination links.", [page.url], ["pagination", "audit"]));
        if ((page.pageNumber ?? 1) > 1 && page.canonicalUrl && /(?:page=1|\/page\/1\/?)$/iu.test(page.canonicalUrl))
            issues.push(issue("pagination-canonical-to-page-one", "pagination-seo", "P2", "Paginated URL canonicalizes to page 1", "Use self-canonical where appropriate; do not blindly canonical all pages to page 1.", [page.url], ["pagination", "audit"]));
        if ((page.pageNumber ?? 1) > 1 && page.isIndexable === false)
            issues.push(issue("pagination-noindex-discovery-risk", "pagination-seo", "P2", "Page 2+ is noindex and may affect product discovery", "Ensure products remain crawlable through links.", [page.url], ["pagination", "audit"]));
    }
    return issues;
}
function checkPolicies(input) {
    const policies = input.policies;
    if (!policies)
        return [];
    const issues = [];
    if (!policies.shippingPolicyUrl)
        issues.push(issue("missing-shipping-policy", "ecommerce-trust-policy", "P2", "Missing shipping policy", "Provide clear shipping policy URL.", ["policies"], ["ecommerce", "audit"]));
    if (!policies.returnPolicyUrl)
        issues.push(issue("missing-return-policy", "ecommerce-trust-policy", "P2", "Missing return/refund policy", "Provide clear return/refund policy URL.", ["policies"], ["ecommerce", "audit"]));
    if (!policies.contactUrl)
        issues.push(issue("missing-contact-policy", "ecommerce-trust-policy", "P2", "Missing contact page", "Provide contact information.", ["policies"], ["ecommerce", "audit"]));
    if (!policies.privacyPolicyUrl)
        issues.push(issue("missing-privacy-policy", "ecommerce-trust-policy", "P3", "Missing privacy policy", "Provide privacy policy URL.", ["policies"], ["ecommerce", "audit"]));
    if (!policies.termsUrl)
        issues.push(issue("missing-terms-policy", "ecommerce-trust-policy", "P3", "Missing terms URL", "Provide terms URL.", ["policies"], ["ecommerce", "audit"]));
    if (policies.paymentSecurityInfo === false)
        issues.push(issue("missing-payment-security-info", "ecommerce-trust-policy", "P3", "Missing payment security info", "Show secure payment/trust information.", ["policies"], ["ecommerce", "audit"]));
    return issues;
}
function checkMerchantFeed(input) {
    const feed = input.merchantFeed;
    if (!feed)
        return [];
    const issues = [];
    if ((feed.missingPriceCount ?? 0) > 0)
        issues.push(issue("merchant-feed-missing-prices", "merchant-feed-readiness", "P1", "Merchant feed has products missing price", "Provide accurate prices; do not invent them.", [String(feed.missingPriceCount)], ["product", "audit"]));
    if ((feed.missingAvailabilityCount ?? 0) > 0)
        issues.push(issue("merchant-feed-missing-availability", "merchant-feed-readiness", "P1", "Merchant feed has products missing availability", "Provide accurate availability.", [String(feed.missingAvailabilityCount)], ["product", "audit"]));
    if ((feed.missingImageCount ?? 0) > 0)
        issues.push(issue("merchant-feed-missing-images", "merchant-feed-readiness", "P2", "Merchant feed has products missing image", "Provide product images.", [String(feed.missingImageCount)], ["product", "audit"]));
    if ((feed.missingGtinCount ?? 0) > 0)
        issues.push(issue("merchant-feed-missing-gtin", "merchant-feed-readiness", "P3", "Merchant feed has missing GTIN values", "Add GTIN/MPN/brand where applicable.", [String(feed.missingGtinCount)], ["product", "audit"]));
    if (feed.currencyConsistency === false)
        issues.push(issue("merchant-feed-currency-inconsistent", "merchant-feed-readiness", "P1", "Merchant feed currency is inconsistent", "Align feed and website currency.", ["currencyConsistency=false"], ["product", "audit"]));
    return issues;
}
function checkInternalLinks(input) {
    const issues = [];
    const links = input.internalLinks ?? [];
    for (const product of input.products ?? []) {
        if (!links.some((link) => link.to === product.url && ["breadcrumb", "navigation", "contextual", "related_category"].includes(link.linkType ?? "")))
            issues.push(issue("product-no-category-incoming-links", "ecommerce-internal-linking", "P2", "Product has no provided category/context incoming links", "Link products from categories, breadcrumbs, or related modules.", [product.url], ["product", "audit"]));
    }
    for (const category of input.categories ?? []) {
        if (!links.some((link) => link.from === category.url && /\/p\/|product/iu.test(link.to)))
            issues.push(issue("category-no-product-outgoing-links", "ecommerce-internal-linking", "P2", "Category has no provided product outgoing links", "Ensure category pages link to products crawlably.", [category.url], ["category", "audit"]));
    }
    return issues;
}
function hasInput(input) {
    return Boolean(input.html || input.page || input.categories?.length || input.products?.length || input.filters?.length || input.pagination?.length || input.policies || input.merchantFeed || input.internalLinks?.length);
}
function getMissingInputs(input) {
    const missing = [];
    if (!input.page)
        missing.push("page");
    if (!input.categories?.length)
        missing.push("categories");
    if (!input.products?.length)
        missing.push("products");
    if (!input.filters?.length)
        missing.push("filters");
    if (!input.pagination?.length)
        missing.push("pagination");
    if (!input.policies)
        missing.push("policies");
    if (!input.merchantFeed)
        missing.push("merchantFeed");
    if (!input.internalLinks?.length)
        missing.push("internalLinks");
    return missing;
}
function needsInput() {
    return { skill: "ecommerce-seo", status: "needs_input", score: 0, summary: "Needs input. Provide product, category, filter, pagination, policy, merchant feed, internal link, HTML, or page data.", categoryFindings: [], productFindings: [], variantFindings: [], facetedNavigationFindings: [], paginationFindings: [], trustFindings: [], merchantFeedFindings: [], issues: [], missingInputs: ["html", "page", "categories", "products", "filters", "pagination", "policies", "merchantFeed", "internalLinks"], nextActions: ["Provide explicit ecommerce inputs.", "No live product, Merchant Center, pricing, stock, or review fetching was performed."] };
}
function issue(id, category, priority, title, howToFix, evidence, appliesTo) {
    return { id, category, title, priority, problem: evidence.join("; "), whyItMatters: "Ecommerce SEO depends on accurate product, category, crawl, trust, and feed signals.", howToFix, do: ["Use accurate visible ecommerce data", "Keep commercial pages crawlable and indexable when valuable", "Show trust, policy, and product information"], dont: ["Invent prices, reviews, ratings, stock, shipping, returns, or feed data", "Index low-value ecommerce pages", "Create duplicate product/category pages"], evidence, appliesTo };
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value.replace(/\\"/gu, "\""));
    }
    catch {
        return fallback;
    }
}
function score(issues) {
    return Math.max(0, 100 - issues.reduce((sum, item) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[item.priority]), 0));
}
//# sourceMappingURL=ecommerce-audit.js.map