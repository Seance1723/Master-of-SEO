const technicalPattern = /noindex|crawl|index|robots|sitemap|canonical|redirect|build|security|core web|cwv|performance/iu;
export function runSEOStrategy(input) {
    if (!hasInput(input))
        return needsInput();
    const goals = mapSeoGoals(input);
    const opportunities = prioritizeOpportunities(collectOpportunities(input));
    const matrix = opportunities.map(classifyImpactEffort);
    const issues = buildIssues(input, opportunities);
    const roadmap = buildRoadmap(opportunities, input);
    const output = {
        skill: "seo-strategy-campaign-planning",
        status: getMissingInputs(input).length ? "partial" : "completed",
        score: Math.max(0, 100 - issues.reduce((sum, issue) => sum + ({ P0: 18, P1: 8, P2: 3, P3: 1 }[issue.priority]), 0)),
        summary: `SEO strategy created from provided inputs with ${opportunities.length} prioritized opportunity item(s).`,
        seoGoals: goals,
        priorityOpportunities: opportunities,
        impactEffortMatrix: matrix,
        roadmap,
        technicalPlan: opportunities.filter((item) => item.category === "technical"),
        contentPlan: opportunities.filter((item) => item.category === "content"),
        authorityPlan: opportunities.filter((item) => item.category === "authority"),
        conversionPlan: opportunities.filter((item) => item.category === "conversion"),
        launchChecklist: buildLaunchChecklist(input),
        migrationPlan: buildMigrationPlan(input),
        resourcePlan: buildResourcePlan(input, opportunities),
        risks: buildRisks(input, opportunities),
        issues,
        missingInputs: getMissingInputs(input),
        nextActions: ["Resolve P0/P1 blockers first.", "Sequence roadmap by capacity and dependencies.", "Measure outcomes using only configured analytics/Search Console data when available."]
    };
    return output;
}
export function parseSEOStrategyInputFromText(rawInput) {
    const mode = rawInput.includes("launch-checklist") ? "launch" : rawInput.includes("migration-plan") ? "migration" : rawInput.includes("campaign") ? "campaign" : rawInput.includes("opportunity") ? "opportunity" : rawInput.includes("seo-plan") ? "seo_plan" : "strategy";
    const input = { mode };
    const args = rawInput.replace(/^\/seo-master\s+(?:seo-plan|seo-strategy|seo-campaign-plan|opportunity-plan|launch-checklist|migration-plan)\s*/u, "").trim();
    for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? "";
        if (key === "business")
            input.business = parseJsonFlag(value, undefined);
        if (key === "websiteAudit" || key === "website-audit")
            input.websiteAudit = parseJsonFlag(value, undefined);
        if (key === "keywordResearch" || key === "keyword-research")
            input.keywordResearch = parseJsonFlag(value, undefined);
        if (key === "contentPlan" || key === "content-plan")
            input.contentPlan = parseJsonFlag(value, undefined);
        if (key === "competitorAnalysis" || key === "competitor-analysis")
            input.competitorAnalysis = parseJsonFlag(value, undefined);
        if (key === "resources")
            input.resources = parseJsonFlag(value, undefined);
        if (key === "constraints")
            input.constraints = parseJsonFlag(value, undefined);
        if (key === "launch")
            input.launch = parseJsonFlag(value, undefined);
        if (key === "migration")
            input.migration = parseJsonFlag(value, undefined);
    }
    return input;
}
export function buildLaunchChecklist(input) {
    if (!input.launch)
        return [];
    const checks = [
        ["noindex_removed", "Remove staging/global noindex before launch", input.launch.hasNoindexRemoved],
        ["robots_txt", "Confirm robots.txt is present and not blocking key pages", input.launch.hasRobotsTxt],
        ["sitemap", "Generate and validate sitemap from canonical URLs", input.launch.hasSitemap],
        ["redirects", "Validate redirects when URLs changed", input.launch.hasRedirects],
        ["analytics", "Install analytics before launch", input.launch.hasAnalytics],
        ["search_console", "Set up Search Console before launch", input.launch.hasSearchConsole],
        ["template_qa", "Test key templates before launch", input.launch.templatesTested]
    ];
    return checks.map(([id, task, passed]) => ({ id, task, status: passed === true ? "passed" : "needs_attention" }));
}
export function buildMigrationPlan(input) {
    if (!input.migration)
        return [];
    const redirectMap = input.migration.redirectMap ?? [];
    return [
        { id: "old-url-export", task: "Export old URLs from provided migration inventory where available.", status: input.migration.oldUrls?.length ? "ready" : "needs_input" },
        { id: "redirect-map", task: "Map old URLs to relevant new URLs.", status: redirectMap.length ? "ready" : "missing" },
        { id: "metadata-backup", task: "Back up metadata before migration.", status: input.migration.backedUpMetadata ? "ready" : "needs_attention" },
        { id: "content-backup", task: "Back up important content before migration.", status: input.migration.backedUpContent ? "ready" : "needs_attention" },
        { id: "redirect-testing", task: "Test redirects before launch.", status: input.migration.testedRedirects ? "ready" : "needs_attention" },
        { id: "new-sitemap", task: "Submit the new sitemap after launch.", status: input.migration.submittedNewSitemap ? "ready" : "needs_attention" }
    ];
}
function mapSeoGoals(input) {
    const type = input.business?.websiteType ?? inferType(input);
    const goals = new Set();
    if (input.websiteAudit?.criticalIssues?.length)
        goals.add("Improve crawlability/indexability and remove critical blockers.");
    if (type === "ecommerce" || input.business?.businessGoals?.includes("sales"))
        goals.add("Improve category/product organic sales readiness.");
    if (type === "saas" || input.business?.businessGoals?.some((goal) => ["demo_booking", "signup"].includes(goal)))
        goals.add("Improve demo/signup conversion from organic pages.");
    if (type === "local_business" || input.business?.businessGoals?.includes("local_visits"))
        goals.add("Improve local visibility readiness and local conversion paths.");
    if (type === "blog_news" || input.business?.businessGoals?.includes("content_traffic"))
        goals.add("Expand topical authority and content traffic readiness.");
    if (input.contentPlan?.contentGaps?.length || input.competitorAnalysis?.keywordGaps?.length)
        goals.add("Grow BOFU keyword and content coverage.");
    if (input.launch?.isNewWebsite)
        goals.add("Protect SEO during launch.");
    if (input.migration?.isMigration)
        goals.add("Protect SEO during migration.");
    if (!goals.size)
        goals.add("Create a balanced SEO roadmap from provided inputs.");
    return [...goals];
}
function collectOpportunities(input) {
    const items = [];
    const push = (source, raw, fallback) => {
        const item = typeof raw === "object" && raw ? raw : { title: String(raw || fallback) };
        const title = String(item.title ?? item.keyword ?? item.task ?? item.type ?? fallback);
        items.push({ ...item, title, source, priority: item.priority ?? inferPriority(item), category: inferCategory(title, source), impact: item.impact ?? inferImpact(item), effort: item.effort ?? inferEffort(item), funnelStage: item.funnelStage });
    };
    for (const raw of input.websiteAudit?.criticalIssues ?? [])
        push("websiteAudit.criticalIssues", raw, "Critical audit issue");
    for (const raw of input.websiteAudit?.issues ?? [])
        push("websiteAudit.issues", raw, "Audit issue");
    for (const raw of input.websiteAudit?.quickWins ?? [])
        push("websiteAudit.quickWins", raw, "Quick win");
    for (const raw of input.websiteAudit?.strategicOpportunities ?? [])
        push("websiteAudit.strategicOpportunities", raw, "Strategic opportunity");
    for (const raw of input.keywordResearch?.opportunities ?? [])
        push("keywordResearch.opportunities", raw, "Keyword opportunity");
    for (const raw of input.keywordResearch?.cannibalizationRisks ?? [])
        push("keywordResearch.cannibalizationRisks", raw, "Cannibalization risk");
    for (const raw of input.contentPlan?.contentGaps ?? [])
        push("contentPlan.contentGaps", raw, "Content gap");
    for (const raw of input.contentPlan?.refreshPlan ?? [])
        push("contentPlan.refreshPlan", raw, "Refresh content");
    for (const raw of input.contentPlan?.pruningPlan ?? [])
        push("contentPlan.pruningPlan", raw, "Prune content");
    for (const raw of input.competitorAnalysis?.keywordGaps ?? [])
        push("competitorAnalysis.keywordGaps", raw, "Competitor keyword gap");
    for (const raw of input.competitorAnalysis?.contentGaps ?? [])
        push("competitorAnalysis.contentGaps", raw, "Competitor content gap");
    for (const raw of input.competitorAnalysis?.backlinkGaps ?? [])
        push("competitorAnalysis.backlinkGaps", raw, "Competitor backlink gap");
    for (const raw of input.competitorAnalysis?.serpFeatureOpportunities ?? [])
        push("competitorAnalysis.serpFeatureOpportunities", raw, "SERP feature opportunity");
    return items.length ? items : [{ title: "Define SEO goals and measurement plan", source: "strategy", priority: "P2", category: "strategy", impact: "medium", effort: "low" }];
}
function prioritizeOpportunities(items) {
    return items.map((item) => ({ ...item, priorityScore: priorityScore(item) })).sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
}
function priorityScore(item) {
    const priority = String(item.priority ?? "P2");
    let score = { P0: 100, P1: 80, P2: 55, P3: 30 }[priority] ?? 50;
    if (["bofu", "mofu"].includes(String(item.funnelStage ?? "").toLowerCase()))
        score += 12;
    if (/pricing|demo|sales|lead|signup|transactional|commercial|bofu/iu.test(JSON.stringify(item)))
        score += 10;
    if (String(item.effort).toLowerCase() === "low")
        score += 5;
    return score;
}
function classifyImpactEffort(item) {
    const impact = String(item.impact ?? "medium").toLowerCase();
    const effort = String(item.effort ?? "medium").toLowerCase();
    const classification = impact === "high" && ["low", "medium"].includes(effort) ? "quick_win" : impact === "high" && effort === "high" ? "strategic_project" : impact === "low" && effort === "high" ? "deprioritize" : "incremental";
    return { title: item.title, impact, effort, classification };
}
function buildRoadmap(opportunities, input) {
    const sorted = [...opportunities].sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
    const first30 = sorted.filter((item) => ["P0", "P1"].includes(String(item.priority)) || item.category === "technical");
    const later = sorted.filter((item) => !first30.includes(item));
    return {
        first30Days: first30,
        days31To60: later.filter((item) => String(item.priority) === "P2" || item.category === "content").slice(0, capacity(input)),
        days61To90: later.filter((item) => String(item.priority) === "P3" || item.category === "authority" || item.category === "conversion"),
        longTerm: []
    };
}
function buildResourcePlan(input, opportunities) {
    const contentCapacity = input.resources?.monthlyContentCapacity ?? 4;
    return [
        { role: "developer", monthlyHours: input.resources?.developerHoursPerMonth ?? "unknown", tasks: opportunities.filter((item) => item.category === "technical").length },
        { role: "content", monthlyCapacity: contentCapacity, tasksThisMonth: Math.min(contentCapacity, opportunities.filter((item) => item.category === "content").length) },
        { role: "seo", monthlyHours: input.resources?.seoHoursPerMonth ?? "unknown", tasks: opportunities.length },
        { role: "design", monthlyHours: input.resources?.designerHoursPerMonth ?? "unknown", tasks: opportunities.filter((item) => item.category === "conversion").length }
    ];
}
function buildRisks(input, opportunities) {
    const risks = [];
    if (!input.business?.businessGoals?.length)
        risks.push({ id: "missing-business-goal", priority: "P2", risk: "No business goal provided." });
    if (input.launch && (input.launch.hasAnalytics === false || input.launch.hasSearchConsole === false))
        risks.push({ id: "missing-measurement-setup", priority: "P2", risk: "Launch lacks measurement setup." });
    if (opportunities.some((item) => ["P0", "P1"].includes(String(item.priority))))
        risks.push({ id: "unresolved-high-priority-work", priority: "P1", risk: "Unresolved P0/P1 issues must be sequenced early." });
    if (input.resources?.monthlyContentCapacity !== undefined && input.resources.monthlyContentCapacity < opportunities.filter((item) => item.category === "content").length / 3)
        risks.push({ id: "low-capacity-vs-roadmap", priority: "P2", risk: "Content capacity is low relative to roadmap load." });
    if (input.migration?.isMigration && !(input.migration.redirectMap?.length))
        risks.push({ id: "migration-redirect-map-missing", priority: "P1", risk: "Migration has no redirect map." });
    return risks;
}
function buildIssues(input, opportunities) {
    const issues = [];
    if (!input.business?.businessGoals?.length)
        issues.push(issue("missing-business-goal", "strategy", "Business goal is missing", "P2", "Strategy input has no business goal.", "Define the business outcome before prioritizing SEO work.", ["business.businessGoals missing"], "strategy"));
    if (opportunities.some((item) => String(item.priority) === "P0"))
        issues.push(issue("p0-opportunities-present", "planning", "P0 opportunities require immediate planning", "P0", "Provided inputs include P0 work.", "Schedule P0 blockers first.", ["P0 opportunity"], "roadmap"));
    if (input.launch && (input.launch.hasAnalytics === false || input.launch.hasSearchConsole === false))
        issues.push(issue("launch-measurement-missing", "launch", "Launch measurement setup is missing", "P2", "Analytics or Search Console is missing from launch inputs.", "Set up analytics and Search Console before launch.", ["launch measurement false"], "launch"));
    if (input.migration?.isMigration && !(input.migration.redirectMap?.length))
        issues.push(issue("migration-redirect-map-missing", "migration", "Migration redirect map is missing", "P1", "Migration input has no redirect map.", "Create old-to-new URL redirect map before launch.", ["redirectMap missing"], "migration"));
    if (homepageOnlyRedirect(input))
        issues.push(issue("migration-homepage-only-redirect", "migration", "Homepage-only redirect strategy detected", "P1", "Multiple old URLs redirect to the homepage.", "Map each old URL to the closest relevant new URL.", ["homepage-only redirect pattern"], "migration"));
    return issues;
}
function issue(id, category, title, priority, problem, howToFix, evidence, appliesTo) {
    return { id, category, title, priority, problem, whyItMatters: "SEO strategy should reduce business risk and prioritize work by impact, effort, and dependencies.", howToFix, do: ["Use provided evidence", "Prioritize blockers and business impact"], dont: ["Do not invent rankings, traffic, revenue, or launch status", "Do not overbuild beyond capacity"], evidence, appliesTo: [appliesTo, "planning"] };
}
function inferType(input) {
    if (input.competitorAnalysis?.keywordGaps?.some((gap) => /price|product|category|sales/iu.test(JSON.stringify(gap))))
        return "ecommerce";
    if (input.contentPlan?.contentGaps?.length || input.keywordResearch?.clusters?.length)
        return "blog_news";
    if (input.launch?.isNewWebsite || input.migration?.isMigration)
        return "corporate";
    return "unknown";
}
function inferPriority(item) {
    const text = JSON.stringify(item);
    if (/"P0"|critical|blocker|noindex|failed/iu.test(text))
        return "P0";
    if (/"P1"|high|bofu|transactional|commercial/iu.test(text))
        return "P1";
    if (/"P3"|low/iu.test(text))
        return "P3";
    return "P2";
}
function inferCategory(title, source) {
    if (/backlink|authority|pr|link/iu.test(source + title))
        return "authority";
    if (/conversion|cta|demo|signup|lead|sales|pricing/iu.test(source + title))
        return "conversion";
    if (technicalPattern.test(source + title))
        return "technical";
    if (/content|keyword|cluster|refresh|prun|brief|blog|page/iu.test(source + title))
        return "content";
    return "strategy";
}
function inferImpact(item) {
    const priority = String(item.priority ?? inferPriority(item));
    if (["P0", "P1"].includes(priority) || /high|bofu|revenue|sales|demo/iu.test(JSON.stringify(item)))
        return "high";
    if (/low|P3/iu.test(JSON.stringify(item)))
        return "low";
    return "medium";
}
function inferEffort(item) {
    if (/migration|redesign|technical|build|canonical|redirect/iu.test(JSON.stringify(item)))
        return "high";
    if (/meta|title|h1|cta|internal link|quick/iu.test(JSON.stringify(item)))
        return "low";
    return "medium";
}
function capacity(input) {
    return Math.max(1, input.resources?.monthlyContentCapacity ?? 4);
}
function homepageOnlyRedirect(input) {
    const map = input.migration?.redirectMap ?? [];
    return map.length > 1 && map.every((row) => row.newUrl === "/" || /\/home\/?$/iu.test(row.newUrl ?? ""));
}
function hasInput(input) {
    return Boolean(input.business || input.websiteAudit || input.keywordResearch || input.contentPlan || input.competitorAnalysis || input.resources || input.launch || input.migration);
}
function getMissingInputs(input) {
    return ["business", "websiteAudit", "keywordResearch", "contentPlan", "competitorAnalysis", "resources", "launch", "migration"].filter((key) => !input[key]);
}
function needsInput() {
    return { skill: "seo-strategy-campaign-planning", status: "needs_input", score: 0, summary: "Needs input. Provide business goals, website audit, keyword research, content plan, competitor analysis, resources, launch, or migration data.", seoGoals: [], priorityOpportunities: [], impactEffortMatrix: [], roadmap: { first30Days: [], days31To60: [], days61To90: [], longTerm: [] }, technicalPlan: [], contentPlan: [], authorityPlan: [], conversionPlan: [], launchChecklist: [], migrationPlan: [], resourcePlan: [], risks: [], issues: [], missingInputs: ["business", "websiteAudit", "keywordResearch", "contentPlan", "competitorAnalysis", "resources", "launch", "migration"], nextActions: ["Provide explicit strategy inputs.", "No live audit, ranking, keyword, traffic, competitor, launch, or migration data was fetched."] };
}
function parseJsonFlag(value, fallback) {
    try {
        return JSON.parse(value.replace(/\\"/gu, "\""));
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=seo-strategy.js.map