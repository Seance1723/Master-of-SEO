export function runAISearchAudit(input) {
    const normalized = mergeHtmlAISearchInput({ ...input, mode: input.mode ?? "audit" });
    if (!hasInput(normalized))
        return needsAISearchInput();
    const issues = [
        ...checkSnippetIndexability(normalized),
        ...checkAnswerBlocks(normalized),
        ...checkExtractability(normalized),
        ...checkQueryCoverage(normalized),
        ...checkEntities(normalized),
        ...checkInformationGain(normalized),
        ...checkSources(normalized),
        ...checkAIContentQuality(normalized)
    ];
    const missingInputs = missingAISearchInputs(normalized);
    const status = missingInputs.length ? "partial" : "completed";
    return {
        skill: "ai-search-discover-seo",
        status,
        score: score(issues),
        summary: `${status === "partial" ? "Partial AI Search readiness audit completed" : "AI Search readiness audit completed"}. Reviewed ${normalized.queries?.length ?? 0} query record(s), ${normalized.content?.answerBlocks?.length ?? 0} answer block(s), and found ${issues.length} issue(s).`,
        aiSearchFindings: [`Queries reviewed: ${normalized.queries?.length ?? 0}`, `Page type: ${normalized.page?.pageType ?? "not provided"}`],
        answerBlockFindings: [`Answer blocks reviewed: ${normalized.content?.answerBlocks?.length ?? 0}`],
        entityFindings: [`Entities reviewed: ${normalized.entities?.length ?? 0}`],
        contentQualityFindings: [`Sections reviewed: ${normalized.content?.sections?.length ?? 0}`],
        discoverFindings: [],
        newsPublisherFindings: [],
        issues,
        missingInputs,
        nextActions: issues.length ? ["Fix P1/P2 indexability, snippet, answer, and content quality blockers first.", "Provide explicit entities, sources, and query targets for deeper checks."] : ["Keep content clear, extractable, original, and source-backed."]
    };
}
export function parseAISearchInputFromText(rawInput) {
    const input = { mode: rawInput.includes("answer-block-audit") ? "answer_block" : rawInput.includes("ai-content-quality-audit") ? "content_quality" : "audit" };
    const args = rawInput.replace(/^\/seo-master\s+(?:ai-search-readiness|ai-search-audit|answer-block-audit|ai-content-quality-audit)\s*/u, "").trim();
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
        if (key === "content")
            input.content = parseJsonFlag(value, undefined);
        if (key === "entities")
            input.entities = parseJsonFlag(value, []);
        if (key === "queries")
            input.queries = parseJsonFlag(value, []);
        if (key === "schema")
            input.schema = parseJsonFlag(value, undefined);
    }
    return input;
}
function mergeHtmlAISearchInput(input) {
    if (!input.html)
        return input;
    const title = textMatch(input.html, /<title[^>]*>([\s\S]*?)<\/title>/iu);
    const h1 = textMatch(input.html, /<h1[^>]*>([\s\S]*?)<\/h1>/iu);
    const robots = textMatch(input.html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/iu);
    const bodyText = stripTags(textMatch(input.html, /<body[^>]*>([\s\S]*?)<\/body>/iu) ?? input.html);
    const headings = [...input.html.matchAll(/<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>/giu)].map((match) => stripTags(match[1] ?? "")).filter(Boolean);
    const jsonLd = extractJsonLd(input.html);
    return {
        ...input,
        page: {
            ...input.page,
            title: input.page?.title ?? title,
            h1: input.page?.h1 ?? h1,
            robots: input.page?.robots ?? robots,
            bodyText: input.page?.bodyText ?? bodyText
        },
        content: {
            ...input.content,
            sections: input.content?.sections ?? headings.map((heading) => ({ heading, text: "", type: "unknown" }))
        },
        schema: input.schema ?? (jsonLd.length ? { jsonLd } : undefined)
    };
}
function checkSnippetIndexability(input) {
    const issues = [];
    const robots = input.page?.robots?.toLowerCase() ?? "";
    if (input.page?.isIndexable === false)
        issues.push(issue("ai-page-not-indexable", "snippet-eligibility", "P1", "Page is not indexable for AI search readiness", "Keep valuable pages indexable when AI search visibility matters.", [input.page.url ?? "page"], ["ai_search", "audit"]));
    if (robots.includes("noindex"))
        issues.push(issue("ai-page-robots-noindex", "snippet-eligibility", "P1", "Robots directive contains noindex", "Remove noindex from valuable public pages.", [input.page?.robots ?? "robots"], ["ai_search", "audit"]));
    if (robots.includes("nosnippet"))
        issues.push(issue("ai-page-nosnippet", "snippet-eligibility", "P2", "Robots directive blocks snippets", "Avoid global nosnippet when content should be discoverable.", [input.page?.robots ?? "robots"], ["ai_search", "audit"]));
    if (input.page?.allowsSnippets === false)
        issues.push(issue("ai-snippets-disabled", "snippet-eligibility", "P2", "Snippets are disabled", "Allow snippets unless there is a specific sensitive-content reason.", [input.page.url ?? "page"], ["ai_search", "audit"]));
    if (input.page?.maxSnippet !== undefined && input.page.maxSnippet < 50)
        issues.push(issue("ai-max-snippet-too-low", "snippet-eligibility", "P2", "max-snippet is too restrictive", "Use max-snippet carefully and avoid blocking useful summaries.", [String(input.page.maxSnippet)], ["ai_search", "audit"]));
    if (input.page?.maxImagePreview === "none")
        issues.push(issue("ai-max-image-preview-none", "snippet-eligibility", "P3", "Image previews are blocked", "Use max-image-preview:large where visual discovery matters.", [input.page.url ?? "page"], ["ai_search", "audit"]));
    return issues;
}
function checkAnswerBlocks(input) {
    const issues = [];
    const answerBlocks = input.content?.answerBlocks ?? [];
    const infoQueries = (input.queries ?? []).filter((query) => ["informational", "commercial", "conversational"].includes(query.intent ?? "unknown"));
    if (infoQueries.length && !answerBlocks.length)
        issues.push(issue("missing-answer-block", "answer-block", "P2", "Missing concise answer block for important query", "Add a direct answer near the relevant heading.", infoQueries.map((query) => query.query), ["ai_search", "content", "audit"]));
    for (const block of answerBlocks) {
        const words = wordCount(block.answer);
        if (words > 120)
            issues.push(issue("answer-block-too-long", "answer-block", "P3", "Answer block is too long", "Keep answer blocks concise and complete.", [block.question ?? "answer block", `${words} words`], ["ai_search", "content", "audit"]));
        if (isVague(block.answer))
            issues.push(issue("answer-block-too-vague", "answer-block", "P2", "Answer block is too vague", "Make the answer specific and useful.", [block.answer], ["ai_search", "content", "audit"]));
        if (block.question && !hasMatchingHeading(input, block.question))
            issues.push(issue("answer-block-not-near-heading", "answer-block", "P3", "Answer block lacks matching heading context", "Place key answers near matching headings or questions.", [block.question], ["ai_search", "content", "audit"]));
    }
    return issues;
}
function checkExtractability(input) {
    const issues = [];
    const body = input.page?.bodyText ?? input.content?.summary ?? "";
    if (!input.page?.title && !input.page?.h1)
        issues.push(issue("ai-page-missing-title-h1", "content-extractability", "P2", "Page lacks clear title or H1", "Provide a clear title and H1.", [input.page?.url ?? "page"], ["ai_search", "content", "audit"]));
    if (wordCount(body) > 500 && !(input.content?.sections?.length))
        issues.push(issue("long-page-with-no-headings", "content-extractability", "P2", "Long page has no provided headings", "Use descriptive headings to make content easy to extract.", [`${wordCount(body)} words`], ["ai_search", "content", "audit"]));
    if (["guide", "article", "blog", "service"].includes(input.page?.pageType ?? "") && wordCount(body) > 0 && wordCount(body) < 300)
        issues.push(issue("ai-page-thin-content", "content-extractability", "P2", "Important page has thin content", "Add useful sections, examples, FAQs, and proof.", [`${wordCount(body)} words`], ["ai_search", "content", "audit"]));
    const queryText = (input.queries ?? []).map((query) => query.query).join(" ").toLowerCase();
    const hasUsefulFormats = Boolean(input.content?.tables?.length || input.content?.sections?.some((section) => ["steps", "comparison", "list", "example"].includes(section.type ?? "")));
    if (/\b(how|steps|vs|compare|comparison|best|examples?)\b/u.test(queryText) && !hasUsefulFormats)
        issues.push(issue("missing-extractable-formats", "content-extractability", "P3", "Query intent lacks lists, tables, steps, or examples", "Use formats that match the query and help users scan.", [queryText], ["ai_search", "content", "audit"]));
    if (/^(in today|in this article|welcome|are you looking)/iu.test(body.trim()))
        issues.push(issue("main-answer-buried", "content-extractability", "P2", "Main answer may be buried after generic intro", "Place the direct answer early.", [body.slice(0, 120)], ["ai_search", "content", "audit"]));
    return issues;
}
function checkQueryCoverage(input) {
    const issues = [];
    const coverageText = [input.page?.title, input.page?.h1, ...(input.content?.sections ?? []).map((section) => section.heading), ...(input.content?.faqs ?? []).map((faq) => faq.question)].filter(Boolean).join(" ").toLowerCase();
    for (const query of input.queries ?? []) {
        if (!isCovered(query.query, coverageText))
            issues.push(issue("query-not-covered", "conversational-query-coverage", "P3", "Provided query is not covered by headings or FAQs", "Map conversational queries to useful sections or FAQs.", [query.query], ["ai_search", "content", "audit"]));
    }
    const commercial = (input.queries ?? []).some((query) => ["commercial", "comparison", "pricing"].includes(query.intent ?? ""));
    if (commercial && !/\b(cost|price|pricing|risk|example|alternative|vs|compare)\b/iu.test(coverageText))
        issues.push(issue("commercial-query-support-sections-missing", "conversational-query-coverage", "P3", "Commercial topic lacks cost, risk, comparison, or example sections", "Add decision-support sections where relevant.", [input.page?.title ?? "commercial topic"], ["ai_search", "content", "audit"]));
    return issues;
}
function checkEntities(input) {
    const issues = [];
    const text = `${input.page?.title ?? ""} ${input.page?.h1 ?? ""} ${input.page?.bodyText ?? ""}`.toLowerCase();
    if (/\b(product|service|software|platform|brand|company)\b/u.test(text) && !input.entities?.length && !input.schema?.jsonLd?.length)
        issues.push(issue("missing-entity-inputs", "entity-clarity", "P3", "Page mentions entities but no entity/schema inputs were provided", "Define real organization, product, service, author, or topic entities.", [input.page?.title ?? "page"], ["entity", "audit"]));
    for (const entity of input.entities ?? []) {
        if (!entity.description)
            issues.push(issue("entity-missing-description", "entity-clarity", "P3", "Entity missing description", "Explain what the entity is and why it matters.", [entity.name], ["entity", "audit"]));
        for (const sameAs of entity.sameAs ?? [])
            if (!isUrl(sameAs))
                issues.push(issue("entity-invalid-sameas", "entity-clarity", "P3", "sameAs value is not a URL", "Use only real, relevant sameAs URLs.", [entity.name, sameAs], ["entity", "audit"]));
    }
    const names = new Map();
    for (const entity of input.entities ?? [])
        names.set(normalize(entity.name), [...(names.get(normalize(entity.name)) ?? []), entity.name]);
    for (const values of names.values())
        if (new Set(values).size > 1)
            issues.push(issue("inconsistent-entity-names", "entity-clarity", "P2", "Inconsistent entity names provided", "Use consistent entity naming.", values, ["entity", "audit"]));
    return issues;
}
function checkInformationGain(input) {
    const hasProof = Boolean(input.content?.originalInsights?.length || input.content?.examples?.length || input.content?.caseStudies?.length || input.content?.sources?.length);
    const competitive = (input.queries ?? []).some((query) => ["commercial", "comparison", "pricing", "informational"].includes(query.intent ?? ""));
    if (competitive && !hasProof)
        return [issue("missing-information-gain", "information-gain", "P2", "No original insight, examples, case studies, sources, or proof provided", "Add real examples, proof, data, or expert insight.", (input.queries ?? []).map((query) => query.query), ["ai_search", "content", "audit"])];
    return [];
}
function checkSources(input) {
    const issues = [];
    const body = `${input.page?.bodyText ?? ""} ${input.content?.summary ?? ""}`;
    const highStakes = /\b(medical|legal|financial|security|tax|current|202[0-9]|research|study|statistic|data)\b/iu.test(body);
    if (highStakes && !input.content?.sources?.length)
        issues.push(issue("factual-content-without-sources", "source-citation-quality", "P2", "Factual or high-stakes content has no provided sources", "Cite official, primary, or credible sources where needed.", [input.page?.title ?? "content"], ["ai_search", "content", "audit"]));
    for (const source of input.content?.sources ?? []) {
        if (!source.url || !isUrl(source.url))
            issues.push(issue("source-url-invalid", "source-citation-quality", "P3", "Source URL missing or invalid", "Use valid source URLs.", [source.title ?? "source"], ["content", "audit"]));
        if (["forum", "unknown"].includes(source.type ?? "unknown"))
            issues.push(issue("low-confidence-source-type", "source-citation-quality", "P3", "Source type is low-confidence or unknown", "Prefer official, research, or credible news sources for important claims.", [source.title ?? source.url ?? "source"], ["content", "audit"]));
    }
    return issues;
}
function checkAIContentQuality(input) {
    const body = `${input.content?.summary ?? ""} ${input.page?.bodyText ?? ""}`;
    const hasProof = Boolean(input.content?.originalInsights?.length || input.content?.examples?.length || input.content?.caseStudies?.length || input.content?.sources?.length);
    if (isGeneric(body) && !hasProof)
        return [issue("generic-ai-content-quality-risk", "ai-content-quality", "P2", "Content appears generic and lacks proof or examples", "Add human-reviewed expertise, examples, and evidence.", [body.slice(0, 160)], ["ai_search", "content", "audit"])];
    return [];
}
function hasInput(input) {
    return Boolean(input.html || input.page || input.content || input.entities?.length || input.queries?.length || input.schema?.jsonLd?.length);
}
function missingAISearchInputs(input) {
    const missing = [];
    if (!input.page && !input.html)
        missing.push("page or html");
    if (!input.content)
        missing.push("content");
    if (!input.entities?.length)
        missing.push("entities");
    if (!input.queries?.length)
        missing.push("queries");
    if (!input.schema?.jsonLd?.length)
        missing.push("schema");
    return missing;
}
export function needsAISearchInput() {
    return { skill: "ai-search-discover-seo", status: "needs_input", score: 0, summary: "Needs input. Provide page content, HTML, entities, queries, answer blocks, schema, or source data.", aiSearchFindings: [], answerBlockFindings: [], entityFindings: [], contentQualityFindings: [], discoverFindings: [], newsPublisherFindings: [], issues: [], missingInputs: ["html", "page", "content", "entities", "queries", "schema"], nextActions: ["Provide explicit AI Search readiness inputs.", "No live AI Overview, SERP, or ranking checks were performed."] };
}
export function issue(id, category, priority, title, howToFix, evidence, appliesTo) {
    return { id, category, title, priority, problem: evidence.join("; "), whyItMatters: "AI Search and Discover readiness depend on crawlable, extractable, useful, well-sourced, entity-clear content. This does not guarantee visibility.", howToFix, do: ["Use provided evidence only", "Keep content helpful and extractable", "Avoid promises of AI Overview, Discover, ranking, or rich-result visibility"], dont: ["Invent AI visibility findings", "Use fake sources or entities", "Create content only for bots"], evidence, appliesTo };
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
function textMatch(html, pattern) {
    const match = pattern.exec(html);
    return match?.[1] ? stripTags(match[1]).trim() : undefined;
}
function stripTags(value) {
    return value.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}
function extractJsonLd(html) {
    const blocks = [];
    for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)) {
        try {
            const parsed = JSON.parse(match[1] ?? "");
            if (Array.isArray(parsed))
                blocks.push(...parsed);
            else
                blocks.push(parsed);
        }
        catch {
            // Invalid JSON-LD belongs to schema audit; AI readiness only consumes valid blocks.
        }
    }
    return blocks;
}
function wordCount(value) {
    return value.split(/\s+/u).filter(Boolean).length;
}
function isVague(value) {
    return wordCount(value) < 8 || /\b(it depends|various things|many factors|this topic is important|learn more)\b/iu.test(value);
}
function isGeneric(value) {
    return /\b(in today's digital landscape|unlock your potential|comprehensive solution|seamless experience|game changer|revolutionize|boost your online presence)\b/iu.test(value);
}
function hasMatchingHeading(input, question) {
    const needle = normalize(question).split(" ").slice(0, 4).join(" ");
    return (input.content?.sections ?? []).some((section) => normalize(section.heading ?? "").includes(needle));
}
function isCovered(query, text) {
    const important = normalize(query).split(" ").filter((word) => word.length > 3);
    return important.length > 0 && important.some((word) => text.includes(word));
}
function normalize(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/giu, " ").trim();
}
function isUrl(value) {
    return /^https?:\/\//iu.test(value);
}
//# sourceMappingURL=ai-search-audit.js.map