import type { AISearchAuditInput, DiscoverSEOAuditInput } from "./ai-discover.ts";
import type { ArchitectureAuditInput } from "./architecture.ts";
import type { CMSFrameworkAuditInput } from "./cms-framework.ts";
import type { ContentPlanInput } from "./content.ts";
import type { EcommerceAuditInput } from "./ecommerce.ts";
import type { KeywordResearchInput } from "./keywords.ts";
import type { InternationalSEOAuditInput, LocalSEOAuditInput } from "./local-international.ts";
import type { MediaAuditInput } from "./media.ts";
import type { OnPageAuditInput } from "./on-page.ts";
import type { PerformanceAuditInput } from "./performance.ts";
import type { SchemaAuditInput } from "./schema.ts";
import type { TechnicalAuditInput } from "./technical.ts";
import type { AccessibilityAuditInput, SecurityAuditInput, TrustAuditInput } from "./trust-security-accessibility.ts";

export type WebsiteAuditStatus = "completed" | "partial" | "needs_input";
export type WebsiteAuditPriority = "P0" | "P1" | "P2" | "P3";
export type WebsiteAuditGrade = "A" | "B" | "C" | "D" | "F";
export type WebsiteType = "saas" | "ecommerce" | "local_business" | "blog_news" | "corporate" | "portfolio" | "marketplace" | "documentation" | "landing_page" | "unknown";
export type BusinessGoal = "lead_generation" | "sales" | "demo_booking" | "signup" | "brand_awareness" | "content_traffic" | "local_visits" | "support" | "unknown";

export interface WebsiteAuditPage {
  url: string;
  pageType?: "homepage" | "service" | "product" | "category" | "blog" | "article" | "landing" | "pricing" | "comparison" | "documentation" | "local" | "contact" | "about" | "legal" | "unknown";
  importance?: "critical" | "high" | "medium" | "low" | "unknown";
  html?: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
  bodyText?: string;
  canonicalUrl?: string;
  robots?: string;
  statusCode?: number;
  isIndexable?: boolean;
  primaryKeyword?: string;
  targetKeyword?: string;
}

export interface WebsiteAuditInput {
  url?: string;
  website?: { name?: string; domain?: string; websiteType?: WebsiteType; businessGoal?: BusinessGoal; targetAudience?: string; industry?: string };
  pages?: WebsiteAuditPage[];
  technical?: Partial<TechnicalAuditInput>;
  performance?: Partial<PerformanceAuditInput>;
  onPage?: Partial<OnPageAuditInput>;
  keywords?: Partial<KeywordResearchInput> & { keywordClusters?: unknown[] };
  content?: Partial<ContentPlanInput>;
  architecture?: Partial<ArchitectureAuditInput>;
  schema?: Partial<SchemaAuditInput>;
  media?: Partial<MediaAuditInput>;
  ecommerce?: Partial<EcommerceAuditInput>;
  localInternational?: Partial<LocalSEOAuditInput & InternationalSEOAuditInput>;
  aiDiscover?: Partial<AISearchAuditInput & DiscoverSEOAuditInput>;
  trustSecurityAccessibility?: Partial<TrustAuditInput & SecurityAuditInput & AccessibilityAuditInput>;
  cmsFramework?: Partial<CMSFrameworkAuditInput>;
  mode?: "website" | "page" | "template" | "full" | "partial";
}

export interface WebsiteAuditIssue {
  id: string;
  category: string;
  sourceSkill: string;
  title: string;
  priority: WebsiteAuditPriority;
  problem: string;
  whyItMatters: string;
  howToFix: string;
  do: string[];
  dont: string[];
  evidence: string[];
  appliesTo: Array<"website" | "page" | "template" | "audit">;
  affectedPages?: string[];
  affectedTemplates?: string[];
  sourceSkills?: string[];
}

export interface WebsiteAuditOutput {
  skill: "website-audit";
  status: WebsiteAuditStatus;
  score: number;
  grade: WebsiteAuditGrade;
  summary: string;
  websiteType: string;
  businessGoal: string;
  categoryScores: {
    technicalSeo: number;
    performanceSeo: number;
    onPageSeo: number;
    contentSeo: number;
    architectureInternalLinking: number;
    schemaEntitySeo: number;
    mediaSeo: number;
    ecommerceSeo: number | null;
    localInternationalSeo: number | null;
    aiSearchDiscoverSeo: number;
    trustSecurityAccessibility: number;
    cmsFrameworkSeo: number;
  };
  criticalIssues: WebsiteAuditIssue[];
  quickWins: string[];
  strategicOpportunities: string[];
  categoryFindings: string[];
  pageFindings: string[];
  templateFindings: string[];
  issues: WebsiteAuditIssue[];
  roadmap: { first7Days: string[]; first30Days: string[]; days31To60: string[]; days61To90: string[] };
  missingInputs: string[];
  nextActions: string[];
}
