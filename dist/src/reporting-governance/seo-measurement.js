export function runSEOMeasurement(input) {
    if (!hasInput(input))
        return needsInput();
    const kpis = mapKpis(input);
    const searchConsoleFindings = searchConsoleDiagnostics(input);
    const ga4Findings = ga4Diagnostics(input);
    const conversionFindings = conversionDiagnostics(input);
    const keywordFindings = keywordDiagnostics(input);
    const contentDecayFindings = contentDecay(input);
    const coreWebVitalsFindings = cwvFindings(input);
    const backlinkFindings = backlinkDiagnostics(input);
    const revenueFindings = revenueDiagnostics(input);
    const governanceFindings = governanceDiagnostics(input);
    const qaChecklist = buildQaChecklist();
    const releaseRiskFindings = releaseRisks(input);
    const roadmapProgress = roadmapProgressFindings(input);
    const issues = buildIssues(input, { searchConsoleFindings, ga4Findings, conversionFindings, contentDecayFindings, coreWebVitalsFindings, backlinkFindings, revenueFindings, governanceFindings, releaseRiskFindings });
    const executiveSummary = buildExecutiveSummary(input, issues);
    const finalReport = { currentStatus: input.websiteAudit ? { score: input.websiteAudit.score, grade: input.websiteAudit.grade } : "missing_audit", kpiHealth: kpis, priorityIssues: issues.slice(0, 10), roadmap: input.websiteAudit?.roadmap ?? input.seoStrategy?.roadmap ?? null, risks: [...governanceFindings, ...releaseRiskFindings], governanceChecklist: qaChecklist, missingData: missingInputs(input) };
    return { skill: "measurement-reporting-governance", status: missingInputs(input).length ? "partial" : "completed", score: Math.max(0, 100 - issues.reduce((sum, issue) => sum + ({ P0: 20, P1: 8, P2: 3, P3: 1 }[issue.priority]), 0)), summary: `Reporting and governance generated from provided inputs with ${issues.length} issue(s).`, executiveSummary, kpis, searchConsoleFindings, ga4Findings, conversionFindings, keywordFindings, contentDecayFindings, coreWebVitalsFindings, backlinkFindings, revenueFindings, governanceFindings, qaChecklist, releaseRiskFindings, roadmapProgress, finalReport, issues, missingInputs: missingInputs(input), nextActions: ["Review P0/P1 measurement and governance risks first.", "Keep reports evidence-based and call out missing data.", "Maintain SEO QA and changelog before release."] };
}
export function parseReportingGovernanceInputFromText(rawInput) {
    const mode = rawInput.includes("governance-check") ? "governance" : rawInput.includes("seo-qa") ? "qa" : rawInput.includes("release-seo-check") ? "release" : rawInput.includes("final-status") ? "final" : rawInput.includes("measurement-report") ? "measurement" : "report";
    const input = { mode };
    const args = rawInput.replace(/^\/seo-master\s+(?:report|seo-report|measurement-report|governance-check|seo-qa|release-seo-check|final-status)\s*/u, "").trim();
    for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "business")
            input.business = parseJson(value);
        if (key === "websiteAudit" || key === "website-audit")
            input.websiteAudit = parseJson(value);
        if (key === "seoStrategy" || key === "seo-strategy")
            input.seoStrategy = parseJson(value);
        if (key === "searchConsole" || key === "search-console")
            input.searchConsole = parseJson(value);
        if (key === "ga4")
            input.ga4 = parseJson(value);
        if (key === "rankTracking" || key === "rank-tracking")
            input.rankTracking = parseJson(value) ?? [];
        if (key === "coreWebVitals" || key === "core-web-vitals")
            input.coreWebVitals = parseJson(value);
        if (key === "backlinks")
            input.backlinks = parseJson(value);
        if (key === "contentPerformance" || key === "content-performance")
            input.contentPerformance = parseJson(value) ?? [];
        if (key === "governance")
            input.governance = parseJson(value);
    }
    return input;
}
export function mapKpis(input) {
    const type = input.business?.websiteType ?? "unknown";
    if (type === "saas")
        return ["demo requests", "signups", "pricing page organic sessions", "trial starts"].map((name) => kpi(name, "SaaS conversions"));
    if (type === "ecommerce")
        return ["organic revenue", "product/category sessions", "add-to-cart", "checkout", "purchases"].map((name) => kpi(name, "Ecommerce revenue"));
    if (type === "local_business")
        return ["calls", "contact forms", "direction clicks", "local page visits"].map((name) => kpi(name, "Local conversions"));
    if (type === "blog_news")
        return ["clicks", "impressions", "engaged sessions", "returning users", "Discover-ready content"].map((name) => kpi(name, "Content performance"));
    if (type === "documentation")
        return ["organic support traffic", "support event completion"].map((name) => kpi(name, "Support success"));
    return ["organic clicks", "organic sessions", "conversions", "priority issue progress"].map((name) => kpi(name, "Core SEO measurement"));
}
export function buildQaChecklist() {
    return ["metadata", "H1/headings", "canonical", "robots/noindex", "sitemap", "redirects", "schema", "Core Web Vitals", "mobile", "accessibility", "forms", "analytics", "Search Console", "Open Graph", "trust/legal pages", "404 page", "template QA"].map((item) => ({ item, status: "check_required" }));
}
export function releaseRisks(input) {
    return (input.governance?.pendingChanges ?? []).map((change) => ({ ...change, releaseStatus: change.riskLevel === "high" ? "blocked" : change.riskLevel === "medium" ? "needs_review" : "safe", requiredChecks: requiredChecks(change.type), recommendedApproverRoles: ["SEO", "Engineering"] }));
}
function searchConsoleDiagnostics(input) {
    const rows = [...(input.searchConsole?.pages ?? []), ...(input.searchConsole?.queries ?? [])];
    const findings = [];
    if (input.searchConsole?.impressions !== undefined && input.searchConsole.ctr !== undefined && ((input.searchConsole.impressions > 1000 && input.searchConsole.ctr < 1) || (input.searchConsole.impressions > 500 && input.searchConsole.ctr < 2)))
        findings.push({ type: "high_impression_low_ctr", evidence: "site-level GSC inputs" });
    if (input.searchConsole?.averagePosition !== undefined && input.searchConsole.averagePosition > 10 && input.searchConsole.averagePosition <= 20)
        findings.push({ type: "page_2_opportunity", evidence: "site-level average position" });
    for (const row of rows) {
        if (row.impressions !== undefined && row.ctr !== undefined && row.impressions > 1000 && row.ctr < 1)
            findings.push({ type: "high_impression_low_ctr", item: "url" in row ? row.url : row.query });
        if (row.averagePosition !== undefined && row.averagePosition > 10 && row.averagePosition <= 20)
            findings.push({ type: "page_2_opportunity", item: "url" in row ? row.url : row.query });
    }
    if (input.searchConsole?.indexing?.notIndexedPages)
        findings.push({ type: "indexing_review", notIndexedPages: input.searchConsole.indexing.notIndexedPages });
    return findings;
}
function ga4Diagnostics(input) {
    const findings = [];
    for (const page of input.ga4?.landingPages ?? [])
        if ((page.sessions ?? 0) > 100 && (page.conversions ?? 0) === 0)
            findings.push({ type: "traffic_no_conversions", url: page.url });
    return findings;
}
function conversionDiagnostics(input) {
    const goals = input.business?.businessGoals ?? [];
    const hasConversions = input.ga4?.conversions !== undefined || input.ga4?.events?.some((event) => event.isConversion);
    return goals.some((goal) => ["lead_generation", "sales", "demo_booking", "signup"].includes(goal)) && !hasConversions ? [{ type: "missing_conversion_tracking", goals }] : [];
}
function keywordDiagnostics(input) {
    return (input.rankTracking ?? []).filter((row) => row.rank !== undefined && row.rank > 10 && row.rank <= 20).map((row) => ({ type: "page_2_keyword", keyword: row.keyword, rank: row.rank }));
}
function contentDecay(input) {
    return (input.contentPerformance ?? []).filter((item) => dropped(item.clicks, item.previousClicks) || dropped(item.sessions, item.previousSessions)).map((item) => ({ type: "content_decay", url: item.url, recommendation: "Review refresh, merge, prune, or improve." }));
}
function cwvFindings(input) {
    const findings = [];
    if ((input.coreWebVitals?.lcp ?? 0) > 2.5)
        findings.push({ metric: "LCP", value: input.coreWebVitals?.lcp, status: "issue" });
    if ((input.coreWebVitals?.inp ?? 0) > 200)
        findings.push({ metric: "INP", value: input.coreWebVitals?.inp, status: "issue" });
    if ((input.coreWebVitals?.cls ?? 0) > 0.1)
        findings.push({ metric: "CLS", value: input.coreWebVitals?.cls, status: "issue" });
    for (const page of input.coreWebVitals?.pages ?? [])
        if (page.status === "poor" || (page.lcp ?? 0) > 2.5 || (page.inp ?? 0) > 200 || (page.cls ?? 0) > 0.1)
            findings.push({ url: page.url, metric: "page_cwv", status: page.status ?? "issue" });
    return findings;
}
function backlinkDiagnostics(input) {
    const findings = [];
    for (const link of input.backlinks?.links ?? [])
        if (link.isSpam)
            findings.push({ type: "spam_backlink", sourceUrl: link.sourceUrl });
    if ((input.backlinks?.lostLinks ?? 0) > (input.backlinks?.newLinks ?? 0))
        findings.push({ type: "lost_links_exceed_new_links" });
    return findings;
}
function revenueDiagnostics(input) {
    if (input.business?.websiteType === "ecommerce" && input.ga4?.revenue === undefined)
        return [{ type: "missing_revenue_tracking" }];
    if (input.business?.websiteType === "saas" && input.ga4?.conversions === undefined)
        return [{ type: "missing_saas_conversion_tracking" }];
    return [];
}
function governanceDiagnostics(input) {
    const gov = input.governance;
    if (!gov)
        return [];
    const checks = [["seo_qa_process", gov.hasSeoQaProcess], ["release_checklist", gov.hasReleaseChecklist], ["redirect_policy", gov.hasRedirectPolicy], ["content_update_process", gov.hasContentUpdateProcess], ["analytics_review_cadence", gov.hasAnalyticsReviewCadence], ["seo_changelog", gov.hasSeoChangelog]];
    return checks.filter(([, value]) => value === false).map(([type]) => ({ type, status: "missing" }));
}
function roadmapProgressFindings(input) {
    return input.seoStrategy?.roadmap ? [{ type: "roadmap_provided", roadmap: input.seoStrategy.roadmap }] : [];
}
function buildIssues(input, data) {
    const issues = [];
    if (!input.searchConsole)
        issues.push(issue("missing-search-console-data", "measurement", "Search Console data missing", "P3", "No Search Console-style data provided.", "Connect or provide GSC-style data.", ["searchConsole missing"], "measurement"));
    if (!input.ga4)
        issues.push(issue("missing-ga4-data", "measurement", "GA4 data missing", "P3", "No GA4-style data provided.", "Connect or provide GA4-style organic data.", ["ga4 missing"], "measurement"));
    for (const finding of data.searchConsoleFindings ?? [])
        issues.push(issue(String(finding.type), "search-console", String(finding.type), "P2", "Search Console opportunity detected from provided data.", "Review affected pages/queries.", [JSON.stringify(finding)], "measurement"));
    for (const finding of data.ga4Findings ?? [])
        issues.push(issue("traffic-no-conversions", "ga4", "Organic landing page has traffic but zero conversions", "P2", "Provided landing page has sessions and zero conversions.", "Review intent, CTA, trust, and event tracking.", [JSON.stringify(finding)], "measurement"));
    for (const finding of data.conversionFindings ?? [])
        issues.push(issue("missing-conversion-tracking", "analytics", "Conversion tracking missing for business goal", "P1", "Business goal requires conversions, but conversion data/events are missing.", "Define and mark business-critical events as conversions.", [JSON.stringify(finding)], "measurement"));
    for (const finding of data.contentDecayFindings ?? [])
        issues.push(issue("content-decay", "content-decay", "Content decay detected", "P2", "Provided previous-period data is 20%+ higher than current data.", "Refresh, merge, prune, or improve content.", [JSON.stringify(finding)], "reporting"));
    for (const finding of data.coreWebVitalsFindings ?? [])
        issues.push(issue(`cwv-${finding.metric ?? "page"}`, "core-web-vitals", "Core Web Vitals issue", "P2", "Provided CWV metric is outside recommended threshold.", "Prioritize affected metric/page.", [JSON.stringify(finding)], "measurement"));
    for (const finding of data.backlinkFindings ?? [])
        issues.push(issue("backlink-risk", "backlinks", "Backlink risk or loss detected", "P2", "Provided backlink data contains spam or lost-link risk.", "Review quality and relevance; avoid spam recovery tactics.", [JSON.stringify(finding)], "measurement"));
    for (const finding of data.revenueFindings ?? [])
        issues.push(issue(String(finding.type), "revenue-attribution", "Revenue or conversion attribution missing", "P2", "Business model needs revenue/conversion attribution, but data is missing.", "Set up relevant organic attribution.", [JSON.stringify(finding)], "measurement"));
    for (const finding of data.governanceFindings ?? [])
        issues.push(issue(`governance-${finding.type}`, "governance", "SEO governance process missing", finding.type === "seo_qa_process" ? "P1" : "P2", "A governance control is missing.", "Add the missing SEO process.", [JSON.stringify(finding)], "governance"));
    for (const finding of data.releaseRiskFindings ?? [])
        if (finding.releaseStatus !== "safe")
            issues.push(issue("release-risk", "release", "Release needs SEO review", finding.releaseStatus === "blocked" ? "P1" : "P2", "Pending change has SEO release risk.", "Run required SEO checks before release.", [JSON.stringify(finding)], "release"));
    return dedupe(issues);
}
function buildExecutiveSummary(input, issues) {
    return [`- Report is based only on provided inputs.`, `- ${issues.filter((issue) => ["P0", "P1"].includes(issue.priority)).length} high-priority risk(s) need attention.`, `- Audit score: ${input.websiteAudit?.score ?? "not provided"}.`, `- Missing data: ${missingInputs(input).join(", ") || "none"}.`, `- Next priority: fix measurement and governance gaps before making performance claims.`].join("\n");
}
function issue(id, category, title, priority, problem, howToFix, evidence, appliesTo) {
    return { id, category, title, priority, problem, whyItMatters: "Measurement and governance keep SEO decisions evidence-based and reduce release risk.", howToFix, do: ["Use provided data only", "Report missing data clearly"], dont: ["Do not invent metrics", "Do not hide negative findings"], evidence, appliesTo: [appliesTo] };
}
function kpi(name, category) { return { name, category, whyItMatters: "Maps SEO performance to business goals.", requiredData: ["provided metrics"], priority: "P2" }; }
function dropped(current, previous) { return current !== undefined && previous !== undefined && previous > 0 && current <= previous * 0.8; }
function requiredChecks(type) { return type === "url_change" ? ["redirect map", "canonical QA", "sitemap update"] : type === "template_change" ? ["metadata QA", "schema QA", "template crawl"] : type === "robots_change" || type === "sitemap_change" ? ["technical SEO review"] : ["SEO QA"]; }
function dedupe(issues) { const seen = new Set(); return issues.filter((issue) => { const key = `${issue.id}:${issue.evidence.join("|")}`; if (seen.has(key))
    return false; seen.add(key); return true; }); }
function hasInput(input) { return Boolean(input.business || input.websiteAudit || input.seoStrategy || input.searchConsole || input.ga4 || input.rankTracking?.length || input.coreWebVitals || input.backlinks || input.contentPerformance?.length || input.governance || input.mode === "qa"); }
function missingInputs(input) { return ["business", "websiteAudit", "seoStrategy", "searchConsole", "ga4", "rankTracking", "coreWebVitals", "backlinks", "contentPerformance", "governance"].filter((key) => !input[key]); }
function needsInput() { return { skill: "measurement-reporting-governance", status: "needs_input", score: 0, summary: "Needs input. Provide website audit, SEO strategy, measurement data, governance data, or manual report inputs.", executiveSummary: "Missing reporting inputs.", kpis: [], searchConsoleFindings: [], ga4Findings: [], conversionFindings: [], keywordFindings: [], contentDecayFindings: [], coreWebVitalsFindings: [], backlinkFindings: [], revenueFindings: [], governanceFindings: [], qaChecklist: [], releaseRiskFindings: [], roadmapProgress: [], finalReport: {}, issues: [], missingInputs: ["business", "websiteAudit", "seoStrategy", "searchConsole", "ga4", "rankTracking", "coreWebVitals", "backlinks", "contentPerformance", "governance"], nextActions: ["Provide explicit reporting or governance inputs.", "No live provider data was fetched."] }; }
function parseJson(value) { try {
    return JSON.parse(value.replace(/\\"/gu, "\""));
}
catch {
    return undefined;
} }
//# sourceMappingURL=seo-measurement.js.map