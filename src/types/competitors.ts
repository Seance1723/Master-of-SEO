export type CompetitorStatus = "completed" | "partial" | "needs_input";
export type CompetitorPriority = "P0" | "P1" | "P2" | "P3";
export type CompetitorType = "direct" | "search" | "content" | "local" | "product" | "marketplace" | "unknown";
export type CompetitorIntent = "informational" | "commercial" | "transactional" | "navigational" | "local" | "comparison" | "pricing" | "product_led" | "support" | "unknown";
export type CompetitorPageType = "homepage" | "service" | "product" | "category" | "blog" | "article" | "landing" | "pricing" | "comparison" | "documentation" | "local" | "unknown";
export type SerpFeature = "featured_snippet" | "people_also_ask" | "local_pack" | "video" | "image_pack" | "shopping" | "reviews" | "sitelinks" | "ai_overview" | "news" | "unknown";

export interface CompetitorAnalysisInput {
  business?: {
    name?: string;
    domain?: string;
    industry?: string;
    websiteType?: "saas" | "ecommerce" | "local_business" | "blog_news" | "corporate" | "portfolio" | "marketplace" | "documentation" | "landing_page" | "unknown";
    targetAudience?: string;
    services?: string[];
    products?: string[];
    locations?: string[];
    goals?: Array<"lead_generation" | "sales" | "demo_booking" | "signup" | "brand_awareness" | "content_traffic" | "local_visits" | "support" | "unknown">;
  };
  ownSite?: {
    domain?: string;
    pages?: Array<{
      url: string;
      title?: string;
      h1?: string;
      pageType?: CompetitorPageType;
      targetKeyword?: string;
      rankingKeywords?: string[];
      wordCount?: number;
      schemaTypes?: string[];
      internalLinksCount?: number;
      backlinksCount?: number;
      traffic?: number;
      conversions?: number;
    }>;
  };
  competitors?: Array<{
    name?: string;
    domain?: string;
    type?: CompetitorType;
    pages?: Array<{
      url: string;
      title?: string;
      metaDescription?: string;
      h1?: string;
      headings?: string[];
      pageType?: CompetitorPageType;
      targetKeyword?: string;
      rankingKeywords?: string[];
      wordCount?: number;
      schemaTypes?: string[];
      internalLinksCount?: number;
      backlinksCount?: number;
      traffic?: number;
      ctaText?: string;
      contentSections?: string[];
      notes?: string[];
    }>;
    keywords?: Array<{
      keyword: string;
      rank?: number;
      volume?: number;
      difficulty?: number;
      url?: string;
      intent?: CompetitorIntent;
    }>;
    backlinks?: Array<{
      sourceUrl: string;
      targetUrl?: string;
      anchorText?: string;
      linkType?: "editorial" | "guest_post" | "directory" | "partner" | "resource" | "pr" | "forum" | "unknown";
      authority?: number;
      isSpam?: boolean;
    }>;
    serpFeatures?: SerpFeature[];
  }>;
  serpData?: Array<{
    keyword: string;
    intent?: CompetitorIntent;
    topResults?: Array<{
      url: string;
      domain?: string;
      title?: string;
      pageType?: "blog" | "service" | "product" | "category" | "comparison" | "homepage" | "local" | "video" | "unknown";
      rank?: number;
    }>;
    features?: SerpFeature[];
  }>;
  mode?: "analysis" | "keyword_gap" | "content_gap" | "backlink_gap" | "serp" | "planning";
}

export interface CompetitorIssue {
  id: string;
  category: string;
  title: string;
  priority: CompetitorPriority;
  problem: string;
  whyItMatters: string;
  howToFix: string;
  do: string[];
  dont: string[];
  evidence: string[];
  appliesTo: Array<"competitor_analysis" | "keyword_gap" | "content_gap" | "backlink_gap" | "serp" | "planning">;
}

export interface CompetitorAnalysisOutput {
  skill: "competitor-analysis";
  status: CompetitorStatus;
  score: number;
  summary: string;
  competitorTypes: unknown[];
  serpFindings: unknown[];
  keywordGaps: unknown[];
  contentGaps: unknown[];
  backlinkGaps: unknown[];
  pageStructureFindings: unknown[];
  metadataFindings: unknown[];
  schemaFindings: unknown[];
  uxConversionFindings: unknown[];
  serpFeatureOpportunities: unknown[];
  positioningFindings: unknown[];
  opportunities: unknown[];
  issues: CompetitorIssue[];
  missingInputs: string[];
  nextActions: string[];
}
