import type { CompetitorAnalysisInput, CompetitorAnalysisOutput, CompetitorIssue, CompetitorIntent, CompetitorPageType, CompetitorType, SerpFeature } from "../types/competitors.ts";

const commercialIntents = new Set<CompetitorIntent>(["commercial", "transactional", "pricing", "product_led", "local", "comparison"]);

export function runCompetitorAnalysis(input: CompetitorAnalysisInput): CompetitorAnalysisOutput {
  if (!hasUsableInput(input)) return needsInput(isUrlOnly(input));
  const ownKeywords = collectOwnKeywords(input);
  const ownTargets = new Set((input.ownSite?.pages ?? []).map((page) => normalize(page.targetKeyword)).filter(Boolean));
  const competitorTypes = detectCompetitorTypes(input);
  const serpFindings = analyzeSerp(input, ownTargets);
  const keywordGaps = analyzeKeywordGaps(input, ownKeywords);
  const contentGaps = analyzeContentGaps(input, ownTargets);
  const backlinkGaps = analyzeBacklinkGaps(input);
  const pageStructureFindings = analyzePageStructure(input);
  const metadataFindings = analyzeMetadata(input);
  const schemaFindings = analyzeSchema(input);
  const uxConversionFindings = analyzeUx(input);
  const serpFeatureOpportunities = analyzeSerpFeatures(input);
  const positioningFindings = analyzePositioning(input, competitorTypes);
  const opportunities = prioritizeOpportunities([...keywordGaps, ...contentGaps, ...backlinkGaps, ...serpFeatureOpportunities, ...uxConversionFindings]);
  const issues = buildIssues({ keywordGaps, contentGaps, backlinkGaps, serpFindings, uxConversionFindings });
  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + ({ P0: 20, P1: 8, P2: 3, P3: 1 }[issue.priority]), 0));
  return {
    skill: "competitor-analysis",
    status: getMissingInputs(input).length ? "partial" : "completed",
    score,
    summary: `Competitor analysis completed from provided inputs. Found ${keywordGaps.length} keyword gap(s), ${contentGaps.length} content gap(s), and ${backlinkGaps.length} backlink opportunity signal(s).`,
    competitorTypes,
    serpFindings,
    keywordGaps,
    contentGaps,
    backlinkGaps,
    pageStructureFindings,
    metadataFindings,
    schemaFindings,
    uxConversionFindings,
    serpFeatureOpportunities,
    positioningFindings,
    opportunities,
    issues,
    missingInputs: getMissingInputs(input),
    nextActions: opportunities.length ? ["Prioritize high-intent gaps first.", "Improve existing pages before creating duplicate new pages.", "Use competitor evidence for differentiation, not copying."] : ["Provide competitor keywords, pages, backlinks, or SERP data for deeper analysis."]
  };
}

export function parseCompetitorAnalysisInputFromText(rawInput: string): CompetitorAnalysisInput {
  const mode = rawInput.includes("keyword-gap") ? "keyword_gap" : rawInput.includes("content-gap") ? "content_gap" : rawInput.includes("backlink-gap") ? "backlink_gap" : rawInput.includes("serp-analysis") ? "serp" : "analysis";
  const input: CompetitorAnalysisInput = { mode };
  const args = rawInput.replace(/^\/seo-master\s+(?:competitor-analysis|competitor-audit|competitor-keyword-gap|competitor-content-gap|competitor-backlink-gap|serp-analysis)\s*/u, "").trim();
  const urls = [...args.matchAll(/https?:\/\/[^\s'"]+/giu)].map((match) => match[0]);
  if (urls.length) input.competitors = urls.map((url) => ({ domain: domainFromUrl(url) }));
  for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "business") input.business = parseJsonFlag(value, undefined);
    if (key === "ownSite" || key === "own-site") input.ownSite = parseJsonFlag(value, undefined);
    if (key === "competitors") input.competitors = parseJsonFlag(value, []);
    if (key === "serpData" || key === "serp-data") input.serpData = parseJsonFlag(value, []);
  }
  return input;
}

export function detectCompetitorTypes(input: CompetitorAnalysisInput): Array<{ competitor: string; type: CompetitorType; evidence: string[] }> {
  const serpDomains = new Set((input.serpData ?? []).flatMap((serp) => serp.topResults ?? []).map((result) => normalize(result.domain ?? domainFromUrl(result.url))).filter(Boolean));
  return (input.competitors ?? []).map((competitor) => {
    const evidence: string[] = [];
    if (competitor.type) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: competitor.type, evidence: ["Provided competitor type"] };
    const domain = normalize(competitor.domain);
    const pages = competitor.pages ?? [];
    if (domain && serpDomains.has(domain)) evidence.push("Appears in provided SERP data");
    if (pages.length && pages.every((page) => ["blog", "article"].includes(page.pageType ?? "unknown"))) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "content", evidence: ["Mostly blog/article pages"] };
    if (pages.some((page) => page.pageType === "local") || (competitor.keywords ?? []).some((keyword) => keyword.intent === "local")) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "local", evidence: ["Local page or local intent evidence"] };
    if (pages.some((page) => ["product", "category"].includes(page.pageType ?? ""))) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "product", evidence: ["Product/category page overlap"] };
    if (/marketplace|directory|listing|compare/iu.test(`${competitor.domain ?? ""} ${competitor.name ?? ""}`)) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "marketplace", evidence: ["Marketplace/listing pattern"] };
    if (evidence.length) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "search", evidence };
    if (input.business?.industry && pages.length) return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "direct", evidence: ["Business industry and competitor pages provided"] };
    return { competitor: competitor.name ?? competitor.domain ?? "competitor", type: "unknown", evidence: ["Insufficient role evidence"] };
  });
}

function analyzeSerp(input: CompetitorAnalysisInput, ownTargets: Set<string>): unknown[] {
  return (input.serpData ?? []).map((serp) => {
    const counts = new Map<string, number>();
    for (const result of serp.topResults ?? []) counts.set(result.pageType ?? "unknown", (counts.get(result.pageType ?? "unknown") ?? 0) + 1);
    const dominantPageType = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
    return {
      keyword: serp.keyword,
      dominantPageType,
      features: serp.features ?? [],
      mismatch: Boolean(dominantPageType !== "unknown" && !ownTargets.has(normalize(serp.keyword))),
      recommendation: dominantPageType === "unknown" ? "Provide top result page types for a clearer SERP pattern." : `Consider a ${dominantPageType} page only if it matches your business intent.`
    };
  });
}

function analyzeKeywordGaps(input: CompetitorAnalysisInput, ownKeywords: Set<string>): Array<Record<string, unknown>> {
  const gaps: Array<Record<string, unknown>> = [];
  for (const competitor of input.competitors ?? []) {
    const keywords: Array<{ keyword: string; rank?: number; volume?: number; difficulty?: number; url?: string; intent?: CompetitorIntent }> = [...(competitor.keywords ?? []), ...(competitor.pages ?? []).flatMap((page) => (page.rankingKeywords ?? []).map((keyword) => ({ keyword, url: page.url, intent: inferIntent(keyword) })))];
    for (const item of keywords) {
      const key = normalize(item.keyword);
      if (!key || ownKeywords.has(key)) continue;
      const intent = item.intent ?? inferIntent(item.keyword);
      gaps.push({ keyword: item.keyword, competitor: competitor.domain ?? competitor.name ?? "competitor", intent, rank: item.rank, volume: item.volume, difficulty: item.difficulty, priority: gapPriority(intent, item.rank), reason: "Competitor keyword not found in provided own-site keywords." });
    }
  }
  return uniqueBy(gaps, (gap) => normalize(String(gap.keyword)));
}

function analyzeContentGaps(input: CompetitorAnalysisInput, ownTargets: Set<string>): Array<Record<string, unknown>> {
  const ownPageTypes = new Set((input.ownSite?.pages ?? []).map((page) => page.pageType));
  const gaps: Array<Record<string, unknown>> = [];
  for (const competitor of input.competitors ?? []) {
    for (const page of competitor.pages ?? []) {
      const target = normalize(page.targetKeyword);
      if (target && !ownTargets.has(target)) gaps.push({ type: "target_keyword_gap", keyword: page.targetKeyword, competitorPage: page.url, pageType: page.pageType, priority: commercialPageType(page.pageType) ? "P1" : "P2", recommendation: "Create a differentiated page or improve an existing relevant page." });
      if (page.pageType && !ownPageTypes.has(page.pageType)) gaps.push({ type: "missing_page_type", pageType: page.pageType, competitorPage: page.url, priority: commercialPageType(page.pageType) ? "P1" : "P3", recommendation: "Evaluate whether this page type supports your business goal before creating it." });
      for (const section of page.contentSections ?? []) {
        if (/faq|case stud|proof|comparison|pricing|demo|support|documentation/iu.test(section)) gaps.push({ type: "section_gap", section, competitorPage: page.url, priority: /pricing|demo|case stud|proof/iu.test(section) ? "P2" : "P3", recommendation: "Add original, useful coverage where it improves user decisions." });
      }
    }
  }
  return uniqueBy(gaps, (gap) => `${gap.type}:${gap.keyword ?? gap.pageType ?? gap.section}:${gap.competitorPage}`);
}

function analyzeBacklinkGaps(input: CompetitorAnalysisInput): Array<Record<string, unknown>> {
  const gaps: Array<Record<string, unknown>> = [];
  for (const competitor of input.competitors ?? []) {
    for (const link of competitor.backlinks ?? []) {
      if (link.isSpam) continue;
      gaps.push({ sourceUrl: link.sourceUrl, competitor: competitor.domain ?? competitor.name ?? "competitor", linkType: link.linkType ?? "unknown", authority: link.authority, priority: ["editorial", "partner", "resource", "pr"].includes(link.linkType ?? "") ? "P2" : "P3", recommendation: "Evaluate a relevant, non-spam outreach or relationship opportunity." });
    }
  }
  return uniqueBy(gaps, (gap) => String(gap.sourceUrl));
}

function analyzePageStructure(input: CompetitorAnalysisInput): unknown[] {
  return (input.competitors ?? []).flatMap((competitor) => (competitor.pages ?? []).filter((page) => page.headings?.length || page.contentSections?.length).map((page) => ({ competitor: competitor.domain, url: page.url, headings: page.headings ?? [], sections: page.contentSections ?? [], recommendation: "Use structure as evidence for user needs, not as a copy template." })));
}

function analyzeMetadata(input: CompetitorAnalysisInput): unknown[] {
  const ownMissing = (input.ownSite?.pages ?? []).filter((page) => !page.title || !page.h1);
  const competitorWithMetadata = (input.competitors ?? []).flatMap((competitor) => competitor.pages ?? []).filter((page) => page.title || page.metaDescription);
  return ownMissing.length && competitorWithMetadata.length ? ownMissing.map((page) => ({ url: page.url, issue: "Own page has weaker/missing metadata while competitor metadata evidence is provided.", recommendation: "Write original metadata aligned to intent; do not copy competitor titles." })) : [];
}

function analyzeSchema(input: CompetitorAnalysisInput): unknown[] {
  const ownSchema = new Set((input.ownSite?.pages ?? []).flatMap((page) => page.schemaTypes ?? []).map(normalize));
  return uniqueBy((input.competitors ?? []).flatMap((competitor) => (competitor.pages ?? []).flatMap((page) => (page.schemaTypes ?? []).filter((schema) => !ownSchema.has(normalize(schema)) && !/review|rating/iu.test(schema)).map((schema) => ({ schemaType: schema, competitorPage: page.url, recommendation: "Consider only if valid for visible own-page content." })))), (item) => String(item.schemaType));
}

function analyzeUx(input: CompetitorAnalysisInput): unknown[] {
  const commercialGoal = (input.business?.goals ?? []).some((goal) => ["lead_generation", "sales", "demo_booking", "signup"].includes(goal));
  const ownHasCtaEvidence = (input.ownSite?.pages ?? []).some((page) => page.conversions !== undefined);
  const competitorCtas = (input.competitors ?? []).flatMap((competitor) => (competitor.pages ?? []).filter((page) => page.ctaText).map((page) => ({ competitor: competitor.domain, url: page.url, ctaText: page.ctaText })));
  return commercialGoal && !ownHasCtaEvidence && competitorCtas.length ? [{ issue: "Competitors show CTA evidence while own-site CTA evidence is missing.", priority: "P2", competitorCtas, recommendation: "Add a clearer conversion path aligned with the business goal." }] : [];
}

function analyzeSerpFeatures(input: CompetitorAnalysisInput): Array<Record<string, unknown>> {
  const featureActions: Record<SerpFeature, string> = {
    featured_snippet: "Add concise answer blocks.",
    people_also_ask: "Cover useful follow-up questions.",
    local_pack: "Improve local SEO inputs and local landing pages.",
    video: "Consider useful video content.",
    image_pack: "Improve image SEO.",
    shopping: "Improve product/category and feed readiness.",
    reviews: "Use genuine visible reviews only.",
    sitelinks: "Improve architecture and navigation clarity.",
    ai_overview: "Improve AI Search readiness and entity clarity.",
    news: "Improve publisher/news readiness.",
    unknown: "Provide clearer SERP feature data."
  };
  return uniqueBy((input.serpData ?? []).flatMap((serp) => (serp.features ?? []).map((feature) => ({ keyword: serp.keyword, feature, recommendation: featureActions[feature] }))), (item) => `${item.keyword}:${item.feature}`);
}

function analyzePositioning(input: CompetitorAnalysisInput, types: unknown[]): unknown[] {
  return types.map((item) => ({ ...item as Record<string, unknown>, positioningNote: "Classify competitor role before turning gaps into roadmap items." }));
}

function prioritizeOpportunities(items: unknown[]): unknown[] {
  return (items as Array<Record<string, unknown>>).map((item) => ({ ...item, opportunityScore: item.priority === "P1" ? 90 : item.priority === "P2" ? 70 : 50 })).sort((a, b) => Number(b.opportunityScore) - Number(a.opportunityScore)).slice(0, 20);
}

function buildIssues(data: { keywordGaps: Array<Record<string, unknown>>; contentGaps: Array<Record<string, unknown>>; backlinkGaps: Array<Record<string, unknown>>; serpFindings: unknown[]; uxConversionFindings: unknown[] }): CompetitorIssue[] {
  const issues: CompetitorIssue[] = [];
  if (data.keywordGaps.length) issues.push(issue("competitor-keyword-gap", "keyword_gap", "Competitor keyword gaps found", data.keywordGaps.some((gap) => gap.priority === "P1") ? "P1" : "P2", "Competitors have provided keyword evidence missing from own-site keyword data.", "Map these gaps to existing pages before creating new ones.", data.keywordGaps.map((gap) => String(gap.keyword)), "keyword_gap"));
  if (data.contentGaps.length) issues.push(issue("competitor-content-gap", "content_gap", "Competitor content gaps found", data.contentGaps.some((gap) => gap.priority === "P1") ? "P1" : "P2", "Competitor pages show provided topics/page types not represented in own-site inputs.", "Create differentiated content with a business purpose.", data.contentGaps.map((gap) => String(gap.keyword ?? gap.pageType ?? gap.section)), "content_gap"));
  if (data.backlinkGaps.length) issues.push(issue("competitor-backlink-gap", "backlink_gap", "Relevant competitor backlink opportunities found", "P2", "Competitor backlink inputs include non-spam sources worth evaluating.", "Pursue relevant editorial, partner, resource, or PR opportunities only.", data.backlinkGaps.map((gap) => String(gap.sourceUrl)), "backlink_gap"));
  if ((data.uxConversionFindings as unknown[]).length) issues.push(issue("competitor-ux-conversion-gap", "ux_conversion", "Competitor CTA evidence highlights own conversion gap", "P2", "Commercial competitor pages include CTA evidence while own CTA evidence is missing.", "Clarify the conversion path without copying competitor UX.", ["competitor CTA evidence"], "competitor_analysis"));
  return issues;
}

function issue(id: string, category: string, title: string, priority: CompetitorIssue["priority"], problem: string, howToFix: string, evidence: string[], appliesTo: CompetitorIssue["appliesTo"][number]): CompetitorIssue {
  return { id, category, title, priority, problem, whyItMatters: "Competitor evidence can reveal strategic gaps, but it should guide differentiation rather than copying.", howToFix, do: ["Use provided competitor evidence", "Prioritize business impact and feasibility"], dont: ["Do not invent competitor metrics", "Do not copy competitor content or spam tactics"], evidence, appliesTo: [appliesTo, "planning"] };
}

function collectOwnKeywords(input: CompetitorAnalysisInput): Set<string> {
  return new Set((input.ownSite?.pages ?? []).flatMap((page) => [page.targetKeyword, ...(page.rankingKeywords ?? [])]).map(normalize).filter(Boolean));
}

function gapPriority(intent: CompetitorIntent, rank?: number): CompetitorIssue["priority"] {
  if (commercialIntents.has(intent) && (!rank || rank <= 10)) return "P1";
  if (commercialIntents.has(intent) || (rank !== undefined && rank <= 10)) return "P2";
  return "P3";
}

function inferIntent(keyword: string): CompetitorIntent {
  const value = keyword.toLowerCase();
  if (/\b(price|pricing|cost)\b/u.test(value)) return "pricing";
  if (/\b(vs|versus|alternative|compare|best)\b/u.test(value)) return "comparison";
  if (/\b(buy|hire|book|demo|trial|service|software)\b/u.test(value)) return "transactional";
  if (/\b(near me|city|local)\b/u.test(value)) return "local";
  if (/\b(how|what|why|guide|tips)\b/u.test(value)) return "informational";
  return "unknown";
}

function commercialPageType(type?: CompetitorPageType): boolean {
  return ["service", "product", "category", "landing", "pricing", "comparison", "local"].includes(type ?? "");
}

function hasUsableInput(input: CompetitorAnalysisInput): boolean {
  if (input.business || input.ownSite || input.serpData?.length) return true;
  return Boolean((input.competitors ?? []).some((competitor) => competitor.type || competitor.pages?.length || competitor.keywords?.length || competitor.backlinks?.length || competitor.serpFeatures?.length));
}

function isUrlOnly(input: CompetitorAnalysisInput): boolean {
  return Boolean(input.competitors?.length && input.competitors.every((competitor) => competitor.domain && !competitor.type && !competitor.pages?.length && !competitor.keywords?.length && !competitor.backlinks?.length && !competitor.serpFeatures?.length));
}

function getMissingInputs(input: CompetitorAnalysisInput): string[] {
  return ["business", "ownSite", "competitors", "serpData"].filter((key) => !input[key as keyof CompetitorAnalysisInput]);
}

function needsInput(urlOnly = false): CompetitorAnalysisOutput {
  return { skill: "competitor-analysis", status: "needs_input", score: 0, summary: urlOnly ? "Limited input. Competitor URLs alone are not enough because no live crawling or competitor discovery is performed. Provide own site data, competitor pages, competitor keywords, competitor backlinks, SERP data, or business context." : "Needs input. Provide own site data, competitor pages, competitor keywords, competitor backlinks, SERP data, or business context.", competitorTypes: [], serpFindings: [], keywordGaps: [], contentGaps: [], backlinkGaps: [], pageStructureFindings: [], metadataFindings: [], schemaFindings: [], uxConversionFindings: [], serpFeatureOpportunities: [], positioningFindings: [], opportunities: [], issues: [], missingInputs: ["business", "ownSite", "competitors", "serpData"], nextActions: ["Provide explicit competitor analysis inputs.", "No live crawling, SERP scraping, backlink fetching, keyword API calls, traffic estimation, or competitor discovery was performed."] };
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function normalize(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

function domainFromUrl(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./u, "").toLowerCase(); } catch { return url.replace(/^https?:\/\//iu, "").split("/")[0]?.replace(/^www\./u, "").toLowerCase() ?? url; }
}

function parseJsonFlag<T>(value: string, fallback: T): T {
  try { return JSON.parse(value.replace(/\\"/gu, "\"")) as T; } catch { return fallback; }
}
