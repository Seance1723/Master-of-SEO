export type StrategyStatus = "completed" | "partial" | "needs_input";
export type StrategyPriority = "P0" | "P1" | "P2" | "P3";
export type StrategyMode = "strategy" | "seo_plan" | "campaign" | "opportunity" | "launch" | "migration" | "roadmap";

export interface SEOStrategyInput {
  business?: {
    name?: string;
    domain?: string;
    industry?: string;
    websiteType?: "saas" | "ecommerce" | "local_business" | "blog_news" | "corporate" | "portfolio" | "marketplace" | "documentation" | "landing_page" | "unknown";
    targetAudience?: string;
    services?: string[];
    products?: string[];
    locations?: string[];
    businessGoals?: Array<"lead_generation" | "sales" | "demo_booking" | "signup" | "brand_awareness" | "content_traffic" | "local_visits" | "support" | "revenue_growth" | "retention" | "unknown">;
  };
  websiteAudit?: { score?: number; grade?: "A" | "B" | "C" | "D" | "F"; issues?: Record<string, unknown>[]; criticalIssues?: Record<string, unknown>[]; quickWins?: unknown[]; strategicOpportunities?: unknown[]; categoryScores?: Record<string, unknown> };
  keywordResearch?: { clusters?: Record<string, unknown>[]; keywordMap?: Record<string, unknown>[]; cannibalizationRisks?: Record<string, unknown>[]; opportunities?: Record<string, unknown>[] };
  contentPlan?: { pillarPages?: Record<string, unknown>[]; supportingPages?: Record<string, unknown>[]; contentGaps?: Record<string, unknown>[]; refreshPlan?: Record<string, unknown>[]; pruningPlan?: Record<string, unknown>[]; contentCalendar?: Record<string, unknown>[] };
  competitorAnalysis?: { keywordGaps?: Record<string, unknown>[]; contentGaps?: Record<string, unknown>[]; backlinkGaps?: Record<string, unknown>[]; serpFeatureOpportunities?: Record<string, unknown>[]; opportunities?: Record<string, unknown>[] };
  resources?: { monthlyContentCapacity?: number; developerHoursPerMonth?: number; seoHoursPerMonth?: number; designerHoursPerMonth?: number; budgetLevel?: "low" | "medium" | "high" | "unknown"; teamSize?: number };
  constraints?: { timeline?: "30_days" | "60_days" | "90_days" | "6_months" | "12_months" | "unknown"; priority?: "traffic" | "leads" | "sales" | "technical_cleanup" | "content_growth" | "authority" | "migration" | "launch" | "balanced"; riskTolerance?: "low" | "medium" | "high" | "unknown"; mustAvoid?: string[] };
  launch?: { isNewWebsite?: boolean; launchDate?: string; hasStaging?: boolean; hasAnalytics?: boolean; hasSearchConsole?: boolean; hasSitemap?: boolean; hasRobotsTxt?: boolean; hasRedirects?: boolean; hasNoindexRemoved?: boolean; templatesTested?: boolean };
  migration?: { isMigration?: boolean; migrationType?: "domain" | "cms" | "redesign" | "url_structure" | "http_to_https" | "platform" | "unknown"; oldUrls?: string[]; newUrls?: string[]; redirectMap?: Array<{ oldUrl: string; newUrl?: string; status?: "planned" | "implemented" | "missing" | "unknown" }>; highValuePages?: string[]; backedUpMetadata?: boolean; backedUpContent?: boolean; testedRedirects?: boolean; submittedNewSitemap?: boolean };
  mode?: StrategyMode;
}

export interface StrategyIssue {
  id: string;
  category: string;
  title: string;
  priority: StrategyPriority;
  problem: string;
  whyItMatters: string;
  howToFix: string;
  do: string[];
  dont: string[];
  evidence: string[];
  appliesTo: Array<"strategy" | "planning" | "campaign" | "launch" | "migration" | "roadmap">;
}

export interface SEOStrategyOutput {
  skill: "seo-strategy-campaign-planning";
  status: StrategyStatus;
  score: number;
  summary: string;
  seoGoals: unknown[];
  priorityOpportunities: unknown[];
  impactEffortMatrix: unknown[];
  roadmap: { first30Days: unknown[]; days31To60: unknown[]; days61To90: unknown[]; longTerm: unknown[] };
  technicalPlan: unknown[];
  contentPlan: unknown[];
  authorityPlan: unknown[];
  conversionPlan: unknown[];
  launchChecklist: unknown[];
  migrationPlan: unknown[];
  resourcePlan: unknown[];
  risks: unknown[];
  issues: StrategyIssue[];
  missingInputs: string[];
  nextActions: string[];
}
