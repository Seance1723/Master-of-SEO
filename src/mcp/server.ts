#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runAIContentQualityAudit } from "../ai-discover/ai-generated-content-quality-guard.ts";
import { getAIDiscoverRules } from "../ai-discover/ai-discover-rules.ts";
import { runAISearchAudit } from "../ai-discover/ai-search-audit.ts";
import { runAnswerBlockAudit } from "../ai-discover/answer-block.ts";
import { runDiscoverSEOAudit } from "../ai-discover/discover-seo-audit.ts";
import { runArchitectureAudit } from "../architecture/architecture-audit.ts";
import { getArchitectureRules } from "../architecture/architecture-rules.ts";
import { runBuildSEOCheck } from "../cms-framework/build-seo-check.ts";
import { getCMSFrameworkRules } from "../cms-framework/cms-framework-rules.ts";
import { runFrameworkSEOAudit } from "../cms-framework/framework-seo-audit.ts";
import { runNextJSSEOAudit } from "../cms-framework/nextjs-seo-audit.ts";
import { runReactSEOAudit } from "../cms-framework/react-seo-audit.ts";
import { runStaticSEOAudit } from "../cms-framework/static-seo-audit.ts";
import { runWordPressSEOAudit } from "../cms-framework/wordpress-seo-audit.ts";
import { runCompetitorBacklinkGap } from "../competitors/competitor-backlink-gap.ts";
import { runCompetitorContentGap } from "../competitors/competitor-content-gap.ts";
import { runCompetitorAnalysis } from "../competitors/competitor-analysis.ts";
import { runCompetitorKeywordGap } from "../competitors/competitor-keyword-gap.ts";
import { getCompetitorRules } from "../competitors/competitor-rules.ts";
import { runCompetitorSerpAnalysis } from "../competitors/competitor-serp-analysis.ts";
import { runContentPlan } from "../content/content-plan.ts";
import { getContentRules } from "../content/content-rules.ts";
import { getCommandMenu } from "../core/command-registry.ts";
import { runSeoMaster } from "../core/orchestrator.ts";
import { dataDir, memoryPath } from "../core/paths.ts";
import { runCategorySeoAudit } from "../ecommerce/category-seo.ts";
import { runEcommerceAudit } from "../ecommerce/ecommerce-audit.ts";
import { getEcommerceRules } from "../ecommerce/ecommerce-rules.ts";
import { runProductSeoAudit } from "../ecommerce/product-seo.ts";
import { runKeywordResearch } from "../keywords/keyword-research.ts";
import { getKeywordRules } from "../keywords/keyword-rules.ts";
import { runHreflangAudit, runInternationalSEOAudit } from "../local-international/international-seo-audit.ts";
import { getLocalInternationalRules } from "../local-international/local-international-rules.ts";
import { runLocalSEOAudit } from "../local-international/local-seo-audit.ts";
import { runImageSeoAudit } from "../media/image-seo.ts";
import { runMediaAudit } from "../media/media-audit.ts";
import { getMediaRules } from "../media/media-rules.ts";
import { runVideoSeoAudit } from "../media/video-seo.ts";
import { runOnPageAudit } from "../on-page/on-page-audit.ts";
import { getOnPageRules } from "../on-page/on-page-rules.ts";
import { runPerformanceAudit } from "../performance/performance-audit.ts";
import { getPerformanceRules } from "../performance/performance-rules.ts";
import { runSchemaAudit } from "../schema/schema-audit.ts";
import { runSchemaGenerate } from "../schema/schema-generate.ts";
import { getSchemaRules } from "../schema/schema-rules.ts";
import { runCampaignPlan } from "../strategy/campaign-plan.ts";
import { runLaunchChecklist } from "../strategy/launch-checklist.ts";
import { runMigrationPlan } from "../strategy/migration-plan.ts";
import { runOpportunityPlan } from "../strategy/opportunity-prioritization.ts";
import { runSEOPlan } from "../strategy/seo-plan.ts";
import { runSEOStrategy } from "../strategy/seo-strategy.ts";
import { getStrategyRules } from "../strategy/strategy-rules.ts";
import { runTechnicalAudit } from "../technical/technical-audit.ts";
import { runAccessibilityAudit } from "../trust-security-accessibility/accessibility-audit.ts";
import { runEEATAudit } from "../trust-security-accessibility/eeat-audit.ts";
import { runSecurityAudit } from "../trust-security-accessibility/security-audit.ts";
import { runTrustAudit } from "../trust-security-accessibility/trust-audit.ts";
import { getTrustSecurityAccessibilityRules } from "../trust-security-accessibility/trust-security-accessibility-rules.ts";
import { getTechnicalRules } from "../technical/technical-rules.ts";
import { runPageAudit } from "../website-audit/page-audit.ts";
import { runTemplateAudit } from "../website-audit/template-audit.ts";
import { runWebsiteAudit } from "../website-audit/website-audit.ts";
import { getWebsiteAuditRules } from "../website-audit/website-audit-rules.ts";
import type { ContentPlanInput } from "../types/content.ts";
import type { ArchitectureAuditInput } from "../types/architecture.ts";
import type { EcommerceAuditInput } from "../types/ecommerce.ts";
import type { KeywordResearchInput } from "../types/keywords.ts";
import type { InternationalSEOAuditInput, LocalSEOAuditInput } from "../types/local-international.ts";
import type { MediaAuditInput } from "../types/media.ts";
import type { OnPageAuditInput } from "../types/on-page.ts";
import type { PerformanceAuditInput } from "../types/performance.ts";
import type { SchemaAuditInput } from "../types/schema.ts";
import type { TechnicalAuditInput } from "../types/technical.ts";
import type { AISearchAuditInput, DiscoverSEOAuditInput } from "../types/ai-discover.ts";
import type { AccessibilityAuditInput, SecurityAuditInput, TrustAuditInput } from "../types/trust-security-accessibility.ts";
import type { CMSFrameworkAuditInput } from "../types/cms-framework.ts";
import type { WebsiteAuditInput } from "../types/website-audit.ts";
import type { CompetitorAnalysisInput } from "../types/competitors.ts";
import type { SEOStrategyInput } from "../types/strategy.ts";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

const protocolVersion = "2024-11-05";
let buffer = "";

const tools = [
  {
    name: "seo_master_run",
    description: "Run Master of SEO through the same trigger-safe orchestrator used by the CLI.",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "string", description: "Raw user input. Must start with /seo-master to activate SEO logic." }
      },
      required: ["input"]
    }
  },
  {
    name: "seo_master_commands",
    description: "List all available Master of SEO commands.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "seo_master_technical_audit",
    description: "Run Technical SEO audit logic with explicit provided inputs only. No live crawling is performed.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        html: { type: "string" },
        robotsTxt: { type: "string" },
        sitemapXml: { type: "string" },
        headers: { type: "object" },
        statusCode: { type: "number" },
        canonicalUrl: { type: "string" },
        mode: { type: "string", enum: ["website", "page", "code", "planning"] }
      }
    }
  },
  {
    name: "seo_master_performance_audit",
    description: "Run Performance SEO audit logic with explicit provided inputs only. No live Lighthouse crawl is performed.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        html: { type: "string" },
        headers: { type: "object" },
        assets: { type: "array" },
        metrics: { type: "object" },
        mode: { type: "string", enum: ["website", "page", "code", "planning"] }
      }
    }
  },
  {
    name: "seo_master_on_page_audit",
    description: "Run On-Page SEO audit logic with explicit provided inputs only. No live crawling is performed.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        html: { type: "string" },
        title: { type: "string" },
        metaDescription: { type: "string" },
        h1: { type: "string" },
        headings: { type: "array" },
        bodyText: { type: "string" },
        images: { type: "array" },
        links: { type: "array" },
        ctas: { type: "array" },
        pageType: { type: "string" },
        primaryKeyword: { type: "string" },
        secondaryKeywords: { type: "array" },
        mode: { type: "string", enum: ["website", "page", "code", "planning"] }
      }
    }
  },
  {
    name: "seo_master_keyword_research",
    description: "Run Keyword Research & Intent logic with explicit provided inputs only. No live keyword API fetching is performed.",
    inputSchema: {
      type: "object",
      properties: {
        seedKeywords: { type: "array" },
        competitorKeywords: { type: "array" },
        existingPages: { type: "array" },
        business: { type: "object" },
        keywordMetrics: { type: "array" },
        mode: { type: "string", enum: ["research", "clustering", "mapping", "planning", "audit"] }
      }
    }
  },
  {
    name: "seo_master_content_plan",
    description: "Run Content Strategy & Planning logic with explicit provided inputs only. No live SERP, traffic, competitor, or keyword metric fetching is performed.",
    inputSchema: {
      type: "object",
      properties: {
        business: { type: "object" },
        keywordClusters: { type: "array" },
        existingPages: { type: "array" },
        competitorPages: { type: "array" },
        constraints: { type: "object" },
        mode: { type: "string", enum: ["planning", "brief", "refresh", "pruning", "calendar", "audit"] }
      }
    }
  },
  {
    name: "seo_master_architecture_audit",
    description: "Run Site Architecture & Internal Linking audit logic with explicit provided inputs only. No live crawling is performed.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        pages: { type: "array" },
        links: { type: "array" },
        navigation: { type: "array" },
        breadcrumbs: { type: "array" },
        sitemapUrls: { type: "array" },
        topicClusters: { type: "array" },
        mode: { type: "string", enum: ["audit", "planning", "linking", "architecture"] }
      }
    }
  },
  {
    name: "seo_master_internal_linking_audit",
    description: "Run Internal Linking audit logic with explicit provided inputs only. No live crawling is performed.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        pages: { type: "array" },
        links: { type: "array" },
        navigation: { type: "array" },
        breadcrumbs: { type: "array" },
        sitemapUrls: { type: "array" },
        topicClusters: { type: "array" },
        mode: { type: "string", enum: ["audit", "planning", "linking", "architecture"] }
      }
    }
  },
  {
    name: "seo_master_schema_audit",
    description: "Run Schema & Entity SEO audit logic with explicit provided inputs only. No live validation is performed.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        html: { type: "string" },
        jsonLd: { type: "array" },
        page: { type: "object" },
        organization: { type: "object" },
        author: { type: "object" },
        product: { type: "object" },
        service: { type: "object" },
        softwareApplication: { type: "object" },
        localBusiness: { type: "object" },
        video: { type: "object" },
        jobPosting: { type: "object" },
        mode: { type: "string", enum: ["audit", "generate", "validate", "planning"] }
      }
    }
  },
  {
    name: "seo_master_schema_generate",
    description: "Generate safe JSON-LD from explicit provided inputs only. No fake reviews, ratings, authors, or hidden-content markup.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        html: { type: "string" },
        jsonLd: { type: "array" },
        page: { type: "object" },
        organization: { type: "object" },
        author: { type: "object" },
        product: { type: "object" },
        service: { type: "object" },
        softwareApplication: { type: "object" },
        localBusiness: { type: "object" },
        video: { type: "object" },
        jobPosting: { type: "object" },
        mode: { type: "string", enum: ["audit", "generate", "validate", "planning"] }
      }
    }
  },
  {
    name: "seo_master_media_audit",
    description: "Run Media SEO audit logic with explicit provided inputs only. No live crawling, fetching, OCR, or external validation is performed.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, images: { type: "array" }, videos: { type: "array" }, openGraph: { type: "object" }, schema: { type: "object" }, assets: { type: "array" }, mode: { type: "string", enum: ["audit", "image", "video", "planning"] } } }
  },
  {
    name: "seo_master_image_seo_audit",
    description: "Run Image SEO audit logic with explicit provided inputs only. No image fetching or OCR is performed.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, images: { type: "array" }, openGraph: { type: "object" }, schema: { type: "object" }, assets: { type: "array" }, mode: { type: "string", enum: ["audit", "image", "video", "planning"] } } }
  },
  {
    name: "seo_master_video_seo_audit",
    description: "Run Video SEO audit logic with explicit provided inputs only. No video fetching or external validation is performed.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, videos: { type: "array" }, schema: { type: "object" }, assets: { type: "array" }, mode: { type: "string", enum: ["audit", "image", "video", "planning"] } } }
  },
  {
    name: "seo_master_ecommerce_audit",
    description: "Run Ecommerce SEO audit logic with explicit provided inputs only. No live product, stock, price, review, feed, or Merchant Center fetching is performed.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, categories: { type: "array" }, products: { type: "array" }, filters: { type: "array" }, pagination: { type: "array" }, policies: { type: "object" }, merchantFeed: { type: "object" }, internalLinks: { type: "array" }, mode: { type: "string", enum: ["audit", "category", "product", "variants", "faceted", "planning"] } } }
  },
  {
    name: "seo_master_product_seo_audit",
    description: "Run Product SEO audit logic with explicit provided inputs only. No hallucinated product, price, review, rating, or stock data.",
    inputSchema: { type: "object", properties: { products: { type: "array" }, page: { type: "object" }, policies: { type: "object" }, merchantFeed: { type: "object" }, internalLinks: { type: "array" }, mode: { type: "string", enum: ["audit", "category", "product", "variants", "faceted", "planning"] } } }
  },
  {
    name: "seo_master_category_seo_audit",
    description: "Run Category SEO audit logic with explicit provided inputs only. No live crawling or product fetching.",
    inputSchema: { type: "object", properties: { categories: { type: "array" }, filters: { type: "array" }, pagination: { type: "array" }, internalLinks: { type: "array" }, mode: { type: "string", enum: ["audit", "category", "product", "variants", "faceted", "planning"] } } }
  },
  {
    name: "seo_master_local_seo_audit",
    description: "Run Local SEO audit logic with explicit provided inputs only. No live GBP, maps, citation, or review fetching.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, locations: { type: "array" }, pages: { type: "array" }, googleBusinessProfile: { type: "object" }, citations: { type: "array" }, reviews: { type: "array" }, mode: { type: "string", enum: ["audit", "planning", "local_pages", "citations", "reviews"] } } }
  },
  {
    name: "seo_master_international_seo_audit",
    description: "Run International SEO audit logic with explicit provided inputs only. No live hreflang, country, or language fetching.",
    inputSchema: { type: "object", properties: { site: { type: "object" }, pages: { type: "array" }, hreflangSets: { type: "array" }, localizedContent: { type: "array" }, mode: { type: "string", enum: ["audit", "hreflang", "localization", "planning"] } } }
  },
  {
    name: "seo_master_hreflang_audit",
    description: "Run Hreflang audit logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { site: { type: "object" }, pages: { type: "array" }, hreflangSets: { type: "array" }, localizedContent: { type: "array" }, mode: { type: "string", enum: ["audit", "hreflang", "localization", "planning"] } } }
  },
  {
    name: "seo_master_ai_search_audit",
    description: "Run AI Search readiness audit logic with explicit provided inputs only. No live AI Overview, SERP, or ranking checks are performed.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, content: { type: "object" }, entities: { type: "array" }, queries: { type: "array" }, schema: { type: "object" }, mode: { type: "string", enum: ["audit", "readiness", "answer_block", "content_quality", "planning"] } } }
  },
  {
    name: "seo_master_answer_block_audit",
    description: "Run answer block audit logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { html: { type: "string" }, page: { type: "object" }, content: { type: "object" }, queries: { type: "array" }, mode: { type: "string", enum: ["audit", "readiness", "answer_block", "content_quality", "planning"] } } }
  },
  {
    name: "seo_master_discover_seo_audit",
    description: "Run Discover SEO readiness audit logic with explicit provided inputs only. No live Discover, news, or ranking checks are performed.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, publisher: { type: "object" }, images: { type: "array" }, openGraph: { type: "object" }, contentSignals: { type: "object" }, mode: { type: "string", enum: ["audit", "discover", "news", "planning"] } } }
  },
  {
    name: "seo_master_ai_content_quality_audit",
    description: "Run AI content quality audit logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { html: { type: "string" }, page: { type: "object" }, content: { type: "object" }, entities: { type: "array" }, queries: { type: "array" }, schema: { type: "object" }, mode: { type: "string", enum: ["audit", "readiness", "answer_block", "content_quality", "planning"] } } }
  },
  {
    name: "seo_master_trust_audit",
    description: "Run Trust SEO audit logic with explicit provided inputs only. No hallucinated trust findings.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, organization: { type: "object" }, authors: { type: "array" }, reviewers: { type: "array" }, trustPages: { type: "object" }, testimonials: { type: "array" }, caseStudies: { type: "array" }, mode: { type: "string", enum: ["trust", "eeat", "policy", "audit"] } } }
  },
  {
    name: "seo_master_eeat_audit",
    description: "Run E-E-A-T audit logic with explicit provided inputs only. No fake authors, reviewers, credentials, or proof.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, organization: { type: "object" }, authors: { type: "array" }, reviewers: { type: "array" }, trustPages: { type: "object" }, testimonials: { type: "array" }, caseStudies: { type: "array" }, mode: { type: "string", enum: ["trust", "eeat", "policy", "audit"] } } }
  },
  {
    name: "seo_master_security_audit",
    description: "Run Security SEO audit logic with explicit provided inputs only. No live security, malware, SSL, or external scans.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, headers: { type: "object" }, page: { type: "object" }, resources: { type: "array" }, forms: { type: "array" }, securitySignals: { type: "object" }, mode: { type: "string", enum: ["security", "forms", "headers", "audit"] } } }
  },
  {
    name: "seo_master_accessibility_audit",
    description: "Run Accessibility SEO audit logic with explicit provided inputs only. No live accessibility crawling or external validation.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, page: { type: "object" }, headings: { type: "array" }, images: { type: "array" }, forms: { type: "array" }, links: { type: "array" }, buttons: { type: "array" }, accessibilitySignals: { type: "object" }, mode: { type: "string", enum: ["accessibility", "semantic", "forms", "audit"] } } }
  },
  {
    name: "seo_master_framework_seo_audit",
    description: "Run CMS/framework SEO audit logic with explicit inputs only. No live CMS login, build execution, plugin scan, or crawling.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, html: { type: "string" }, framework: { type: "string" }, cms: { type: "object" }, packageJson: { type: "object" }, frameworkConfig: { type: "object" }, routes: { type: "array" }, build: { type: "object" }, seoFiles: { type: "object" }, mode: { type: "string", enum: ["framework", "wordpress", "react", "nextjs", "static", "build", "audit"] } } }
  },
  {
    name: "seo_master_wordpress_seo_audit",
    description: "Run WordPress SEO audit logic with explicit CMS inputs only.",
    inputSchema: { type: "object", properties: { html: { type: "string" }, cms: { type: "object" }, routes: { type: "array" }, build: { type: "object" }, seoFiles: { type: "object" }, mode: { type: "string", enum: ["framework", "wordpress", "react", "nextjs", "static", "build", "audit"] } } }
  },
  {
    name: "seo_master_react_seo_audit",
    description: "Run React SEO audit logic with explicit inputs only.",
    inputSchema: { type: "object", properties: { html: { type: "string" }, packageJson: { type: "object" }, routes: { type: "array" }, build: { type: "object" }, seoFiles: { type: "object" }, mode: { type: "string", enum: ["framework", "wordpress", "react", "nextjs", "static", "build", "audit"] } } }
  },
  {
    name: "seo_master_nextjs_seo_audit",
    description: "Run Next.js SEO audit logic with explicit inputs only.",
    inputSchema: { type: "object", properties: { html: { type: "string" }, packageJson: { type: "object" }, frameworkConfig: { type: "object" }, routes: { type: "array" }, build: { type: "object" }, seoFiles: { type: "object" }, mode: { type: "string", enum: ["framework", "wordpress", "react", "nextjs", "static", "build", "audit"] } } }
  },
  {
    name: "seo_master_static_seo_audit",
    description: "Run Static Website SEO audit logic with explicit inputs only.",
    inputSchema: { type: "object", properties: { html: { type: "string" }, routes: { type: "array" }, build: { type: "object" }, seoFiles: { type: "object" }, mode: { type: "string", enum: ["framework", "wordpress", "react", "nextjs", "static", "build", "audit"] } } }
  },
  {
    name: "seo_master_build_seo_check",
    description: "Run framework build SEO check logic with explicit build data only. No build is executed.",
    inputSchema: { type: "object", properties: { framework: { type: "string" }, routes: { type: "array" }, build: { type: "object" }, seoFiles: { type: "object" }, mode: { type: "string", enum: ["framework", "wordpress", "react", "nextjs", "static", "build", "audit"] } } }
  },
  {
    name: "seo_master_website_audit",
    description: "Run Website Audit aggregation logic with explicit provided inputs only. No live crawling, Lighthouse, Search Console, GA4, rankings, or external validation.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, website: { type: "object" }, pages: { type: "array" }, technical: { type: "object" }, performance: { type: "object" }, onPage: { type: "object" }, keywords: { type: "object" }, content: { type: "object" }, architecture: { type: "object" }, schema: { type: "object" }, media: { type: "object" }, ecommerce: { type: "object" }, localInternational: { type: "object" }, aiDiscover: { type: "object" }, trustSecurityAccessibility: { type: "object" }, cmsFramework: { type: "object" }, mode: { type: "string", enum: ["website", "page", "template", "full", "partial"] } } }
  },
  {
    name: "seo_master_page_audit",
    description: "Run page-level Website Audit logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, website: { type: "object" }, pages: { type: "array" }, technical: { type: "object" }, performance: { type: "object" }, onPage: { type: "object" }, schema: { type: "object" }, media: { type: "object" }, trustSecurityAccessibility: { type: "object" }, cmsFramework: { type: "object" }, mode: { type: "string", enum: ["website", "page", "template", "full", "partial"] } } }
  },
  {
    name: "seo_master_template_audit",
    description: "Run template-level Website Audit grouping logic with explicit provided page inputs only.",
    inputSchema: { type: "object", properties: { pages: { type: "array" }, mode: { type: "string", enum: ["website", "page", "template", "full", "partial"] } } }
  },
  {
    name: "seo_master_competitor_analysis",
    description: "Run competitor analysis with explicit provided inputs only. No live crawling, SERP scraping, backlink fetching, keyword APIs, or traffic estimation.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, ownSite: { type: "object" }, competitors: { type: "array" }, serpData: { type: "array" }, mode: { type: "string", enum: ["analysis", "keyword_gap", "content_gap", "backlink_gap", "serp", "planning"] } } }
  },
  {
    name: "seo_master_competitor_keyword_gap",
    description: "Run competitor keyword gap logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, ownSite: { type: "object" }, competitors: { type: "array" }, serpData: { type: "array" }, mode: { type: "string", enum: ["analysis", "keyword_gap", "content_gap", "backlink_gap", "serp", "planning"] } } }
  },
  {
    name: "seo_master_competitor_content_gap",
    description: "Run competitor content gap logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, ownSite: { type: "object" }, competitors: { type: "array" }, serpData: { type: "array" }, mode: { type: "string", enum: ["analysis", "keyword_gap", "content_gap", "backlink_gap", "serp", "planning"] } } }
  },
  {
    name: "seo_master_competitor_backlink_gap",
    description: "Run competitor backlink gap logic with explicit provided inputs only. Spam links are not recommended.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, ownSite: { type: "object" }, competitors: { type: "array" }, serpData: { type: "array" }, mode: { type: "string", enum: ["analysis", "keyword_gap", "content_gap", "backlink_gap", "serp", "planning"] } } }
  },
  {
    name: "seo_master_serp_analysis",
    description: "Run SERP analysis from provided SERP data only. No live SERP scraping.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, ownSite: { type: "object" }, competitors: { type: "array" }, serpData: { type: "array" }, mode: { type: "string", enum: ["analysis", "keyword_gap", "content_gap", "backlink_gap", "serp", "planning"] } } }
  },
  {
    name: "seo_master_seo_plan",
    description: "Run SEO plan logic with explicit provided inputs only. No live provider reads or invented metrics.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, websiteAudit: { type: "object" }, keywordResearch: { type: "object" }, contentPlan: { type: "object" }, competitorAnalysis: { type: "object" }, resources: { type: "object" }, constraints: { type: "object" }, launch: { type: "object" }, migration: { type: "object" }, mode: { type: "string", enum: ["strategy", "seo_plan", "campaign", "opportunity", "launch", "migration", "roadmap"] } } }
  },
  {
    name: "seo_master_seo_strategy",
    description: "Run SEO strategy logic with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, websiteAudit: { type: "object" }, keywordResearch: { type: "object" }, contentPlan: { type: "object" }, competitorAnalysis: { type: "object" }, resources: { type: "object" }, constraints: { type: "object" }, launch: { type: "object" }, migration: { type: "object" }, mode: { type: "string", enum: ["strategy", "seo_plan", "campaign", "opportunity", "launch", "migration", "roadmap"] } } }
  },
  {
    name: "seo_master_campaign_plan",
    description: "Run SEO campaign planning with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, websiteAudit: { type: "object" }, keywordResearch: { type: "object" }, contentPlan: { type: "object" }, competitorAnalysis: { type: "object" }, resources: { type: "object" }, constraints: { type: "object" }, mode: { type: "string", enum: ["strategy", "seo_plan", "campaign", "opportunity", "launch", "migration", "roadmap"] } } }
  },
  {
    name: "seo_master_opportunity_plan",
    description: "Run SEO opportunity prioritization with explicit provided inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, websiteAudit: { type: "object" }, keywordResearch: { type: "object" }, contentPlan: { type: "object" }, competitorAnalysis: { type: "object" }, resources: { type: "object" }, constraints: { type: "object" }, mode: { type: "string", enum: ["strategy", "seo_plan", "campaign", "opportunity", "launch", "migration", "roadmap"] } } }
  },
  {
    name: "seo_master_launch_checklist",
    description: "Run launch checklist planning from explicit launch inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, websiteAudit: { type: "object" }, resources: { type: "object" }, constraints: { type: "object" }, launch: { type: "object" }, mode: { type: "string", enum: ["strategy", "seo_plan", "campaign", "opportunity", "launch", "migration", "roadmap"] } } }
  },
  {
    name: "seo_master_migration_plan",
    description: "Run migration planning from explicit migration inputs only.",
    inputSchema: { type: "object", properties: { business: { type: "object" }, websiteAudit: { type: "object" }, resources: { type: "object" }, constraints: { type: "object" }, migration: { type: "object" }, mode: { type: "string", enum: ["strategy", "seo_plan", "campaign", "opportunity", "launch", "migration", "roadmap"] } } }
  }
];

const prompts = [
  "seo-master-migration-plan",
  "seo-master-launch-checklist",
  "seo-master-campaign-plan",
  "seo-master-seo-strategy",
  "seo-master-seo-plan",
  "seo-master-serp-analysis",
  "seo-master-competitor-backlink-gap",
  "seo-master-competitor-content-gap",
  "seo-master-competitor-keyword-gap",
  "seo-master-competitor-analysis",
  "seo-master-full-audit",
  "seo-master-page-audit",
  "seo-master-website-audit",
  "seo-master-build-seo-check",
  "seo-master-static-seo-audit",
  "seo-master-nextjs-seo-audit",
  "seo-master-react-seo-audit",
  "seo-master-wordpress-seo-audit",
  "seo-master-framework-seo-audit",
  "seo-master-accessibility-audit",
  "seo-master-security-audit",
  "seo-master-eeat-audit",
  "seo-master-trust-audit",
  "seo-master-ai-content-quality-audit",
  "seo-master-discover-seo-audit",
  "seo-master-answer-block-audit",
  "seo-master-ai-search-audit",
  "seo-master-hreflang-audit",
  "seo-master-international-seo-audit",
  "seo-master-local-seo-audit",
  "seo-master-category-seo-audit",
  "seo-master-product-seo-audit",
  "seo-master-ecommerce-audit",
  "seo-master-video-seo-audit",
  "seo-master-image-seo-audit",
  "seo-master-media-audit",
  "seo-master-schema-generate",
  "seo-master-schema-audit",
  "seo-master-internal-linking-audit",
  "seo-master-architecture-audit",
  "seo-master-content-plan",
  "seo-master-keyword-research",
  "seo-master-on-page-audit",
  "seo-master-performance-audit",
  "seo-master-technical-audit",
  "seo-master-audit",
  "seo-master-competitor-analysis",
  "seo-master-seo-plan"
].map((name) => ({
  name,
  description: `${name} prompt. Returns planned-module behavior until its module is implemented.`,
  arguments: []
}));

function send(message: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function resultText(text: string): Record<string, unknown> {
  return { content: [{ type: "text", text }] };
}

async function readResource(uri: string): Promise<string> {
  if (uri === "seo-master://memory") return readFile(memoryPath, "utf8");
  if (uri === "seo-master://commands") return readFile(join(dataDir, "commands.json"), "utf8");
  if (uri === "seo-master://groups") return readFile(join(dataDir, "groups.json"), "utf8");
  if (uri === "seo-master://technical-rules") return JSON.stringify(await getTechnicalRules(), null, 2);
  if (uri === "seo-master://performance-rules") return JSON.stringify(await getPerformanceRules(), null, 2);
  if (uri === "seo-master://on-page-rules") return JSON.stringify(await getOnPageRules(), null, 2);
  if (uri === "seo-master://keyword-rules") return JSON.stringify(await getKeywordRules(), null, 2);
  if (uri === "seo-master://content-rules") return JSON.stringify(await getContentRules(), null, 2);
  if (uri === "seo-master://architecture-rules") return JSON.stringify(await getArchitectureRules(), null, 2);
  if (uri === "seo-master://internal-linking-rules") return readFile(join(dataDir, "internal-linking-rules.json"), "utf8");
  if (uri === "seo-master://schema-rules") return JSON.stringify(await getSchemaRules(), null, 2);
  if (uri === "seo-master://entity-seo-rules") return readFile(join(dataDir, "entity-seo-rules.json"), "utf8");
  if (uri === "seo-master://media-rules") return JSON.stringify(await getMediaRules(), null, 2);
  if (uri === "seo-master://image-seo-rules") return readFile(join(dataDir, "image-seo-rules.json"), "utf8");
  if (uri === "seo-master://video-seo-rules") return readFile(join(dataDir, "video-seo-rules.json"), "utf8");
  if (uri === "seo-master://ecommerce-rules") return JSON.stringify(await getEcommerceRules(), null, 2);
  if (uri === "seo-master://product-seo-rules") return readFile(join(dataDir, "product-seo-rules.json"), "utf8");
  if (uri === "seo-master://category-seo-rules") return readFile(join(dataDir, "ecommerce-category-rules.json"), "utf8");
  if (uri === "seo-master://faceted-navigation-rules") return readFile(join(dataDir, "faceted-navigation-rules.json"), "utf8");
  if (uri === "seo-master://local-seo-rules") return JSON.stringify(await getLocalInternationalRules(), null, 2);
  if (uri === "seo-master://international-seo-rules") return readFile(join(dataDir, "international-seo-rules.json"), "utf8");
  if (uri === "seo-master://hreflang-rules") return readFile(join(dataDir, "hreflang-rules.json"), "utf8");
  if (uri === "seo-master://ai-search-rules") return JSON.stringify(await getAIDiscoverRules(), null, 2);
  if (uri === "seo-master://discover-seo-rules") return readFile(join(dataDir, "discover-seo-rules.json"), "utf8");
  if (uri === "seo-master://answer-block-rules") return readFile(join(dataDir, "answer-block-rules.json"), "utf8");
  if (uri === "seo-master://ai-content-quality-rules") return readFile(join(dataDir, "ai-content-quality-rules.json"), "utf8");
  if (uri === "seo-master://trust-rules") return JSON.stringify(await getTrustSecurityAccessibilityRules(), null, 2);
  if (uri === "seo-master://eeat-rules") return readFile(join(dataDir, "eeat-rules.json"), "utf8");
  if (uri === "seo-master://security-rules") return readFile(join(dataDir, "security-seo-rules.json"), "utf8");
  if (uri === "seo-master://accessibility-rules") return readFile(join(dataDir, "accessibility-rules.json"), "utf8");
  if (uri === "seo-master://cms-framework-rules") return JSON.stringify(await getCMSFrameworkRules(), null, 2);
  if (uri === "seo-master://wordpress-seo-rules") return readFile(join(dataDir, "wordpress-seo-rules.json"), "utf8");
  if (uri === "seo-master://react-seo-rules") return readFile(join(dataDir, "react-seo-rules.json"), "utf8");
  if (uri === "seo-master://nextjs-seo-rules") return readFile(join(dataDir, "nextjs-seo-rules.json"), "utf8");
  if (uri === "seo-master://build-seo-rules") return readFile(join(dataDir, "build-seo-rules.json"), "utf8");
  if (uri === "seo-master://website-audit-rules") return JSON.stringify(await getWebsiteAuditRules(), null, 2);
  if (uri === "seo-master://audit-category-weights") return readFile(join(dataDir, "audit-category-weights.json"), "utf8");
  if (uri === "seo-master://audit-roadmap-rules") return readFile(join(dataDir, "audit-roadmap-rules.json"), "utf8");
  if (uri === "seo-master://competitor-rules") return JSON.stringify(await getCompetitorRules(), null, 2);
  if (uri === "seo-master://competitor-keyword-gap-rules") return readFile(join(dataDir, "competitor-keyword-gap-rules.json"), "utf8");
  if (uri === "seo-master://competitor-content-gap-rules") return readFile(join(dataDir, "competitor-content-gap-rules.json"), "utf8");
  if (uri === "seo-master://competitor-backlink-gap-rules") return readFile(join(dataDir, "competitor-backlink-gap-rules.json"), "utf8");
  if (uri === "seo-master://competitor-serp-rules") return readFile(join(dataDir, "competitor-serp-rules.json"), "utf8");
  if (uri === "seo-master://strategy-rules") return JSON.stringify(await getStrategyRules(), null, 2);
  if (uri === "seo-master://seo-plan-rules") return readFile(join(dataDir, "seo-plan-rules.json"), "utf8");
  if (uri === "seo-master://campaign-planning-rules") return readFile(join(dataDir, "campaign-planning-rules.json"), "utf8");
  if (uri === "seo-master://launch-checklist-rules") return readFile(join(dataDir, "launch-checklist-rules.json"), "utf8");
  if (uri === "seo-master://migration-plan-rules") return readFile(join(dataDir, "migration-plan-rules.json"), "utf8");
  throw new Error(`Unknown resource: ${uri}`);
}

async function handle(request: JsonRpcRequest): Promise<void> {
  const { id, method, params = {} } = request;

  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion,
          capabilities: { tools: {}, resources: {}, prompts: {} },
          serverInfo: { name: "master-of-seo", version: "0.1.0" }
        }
      });
      return;
    }

    if (method === "notifications/initialized") return;

    if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools } });
      return;
    }

    if (method === "tools/call") {
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      if (name === "seo_master_run") {
        const response = await runSeoMaster(String(args.input ?? ""));
        send({ jsonrpc: "2.0", id, result: resultText(response.message) });
        return;
      }
      if (name === "seo_master_commands") {
        send({ jsonrpc: "2.0", id, result: resultText(await getCommandMenu()) });
        return;
      }
      if (name === "seo_master_technical_audit") {
        const report = runTechnicalAudit({ mode: "planning", ...(args as Partial<TechnicalAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_performance_audit") {
        const report = runPerformanceAudit({ mode: "planning", ...(args as Partial<PerformanceAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_on_page_audit") {
        const report = runOnPageAudit({ mode: "planning", ...(args as Partial<OnPageAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_keyword_research") {
        const report = runKeywordResearch({ mode: "research", ...(args as Partial<KeywordResearchInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_content_plan") {
        const report = runContentPlan({ mode: "planning", ...(args as Partial<ContentPlanInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_architecture_audit" || name === "seo_master_internal_linking_audit") {
        const report = runArchitectureAudit({ mode: "audit", ...(args as Partial<ArchitectureAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_schema_audit") {
        const report = runSchemaAudit({ mode: "audit", ...(args as Partial<SchemaAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_schema_generate") {
        const report = runSchemaGenerate({ mode: "generate", ...(args as Partial<SchemaAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_media_audit") {
        const report = runMediaAudit({ mode: "audit", ...(args as Partial<MediaAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_image_seo_audit") {
        const report = runImageSeoAudit({ mode: "image", ...(args as Partial<MediaAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_video_seo_audit") {
        const report = runVideoSeoAudit({ mode: "video", ...(args as Partial<MediaAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_ecommerce_audit") {
        const report = runEcommerceAudit({ mode: "audit", ...(args as Partial<EcommerceAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_product_seo_audit") {
        const report = runProductSeoAudit({ mode: "product", ...(args as Partial<EcommerceAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_category_seo_audit") {
        const report = runCategorySeoAudit({ mode: "category", ...(args as Partial<EcommerceAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_local_seo_audit") {
        const report = runLocalSEOAudit({ mode: "audit", ...(args as Partial<LocalSEOAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_international_seo_audit") {
        const report = runInternationalSEOAudit({ mode: "audit", ...(args as Partial<InternationalSEOAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_hreflang_audit") {
        const report = runHreflangAudit({ mode: "hreflang", ...(args as Partial<InternationalSEOAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_ai_search_audit") {
        const report = runAISearchAudit({ mode: "audit", ...(args as Partial<AISearchAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_answer_block_audit") {
        const report = runAnswerBlockAudit({ mode: "answer_block", ...(args as Partial<AISearchAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_discover_seo_audit") {
        const report = runDiscoverSEOAudit({ mode: "discover", ...(args as Partial<DiscoverSEOAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_ai_content_quality_audit") {
        const report = runAIContentQualityAudit({ mode: "content_quality", ...(args as Partial<AISearchAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_trust_audit") {
        const report = runTrustAudit({ mode: "trust", ...(args as Partial<TrustAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_eeat_audit") {
        const report = runEEATAudit({ mode: "eeat", ...(args as Partial<TrustAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_security_audit") {
        const report = runSecurityAudit({ mode: "security", ...(args as Partial<SecurityAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_accessibility_audit") {
        const report = runAccessibilityAudit({ mode: "accessibility", ...(args as Partial<AccessibilityAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_framework_seo_audit") {
        const report = runFrameworkSEOAudit({ mode: "framework", ...(args as Partial<CMSFrameworkAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_wordpress_seo_audit") {
        const report = runWordPressSEOAudit({ mode: "wordpress", ...(args as Partial<CMSFrameworkAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_react_seo_audit") {
        const report = runReactSEOAudit({ mode: "react", ...(args as Partial<CMSFrameworkAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_nextjs_seo_audit") {
        const report = runNextJSSEOAudit({ mode: "nextjs", ...(args as Partial<CMSFrameworkAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_static_seo_audit") {
        const report = runStaticSEOAudit({ mode: "static", ...(args as Partial<CMSFrameworkAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_build_seo_check") {
        const report = runBuildSEOCheck({ mode: "build", ...(args as Partial<CMSFrameworkAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_website_audit") {
        const report = runWebsiteAudit({ mode: "website", ...(args as Partial<WebsiteAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_page_audit") {
        const report = runPageAudit({ mode: "page", ...(args as Partial<WebsiteAuditInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_template_audit") {
        const report = runTemplateAudit(((args as Partial<WebsiteAuditInput>).pages ?? []) as WebsiteAuditInput["pages"]);
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_competitor_analysis") {
        const report = runCompetitorAnalysis({ mode: "analysis", ...(args as Partial<CompetitorAnalysisInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_competitor_keyword_gap") {
        const report = runCompetitorKeywordGap({ mode: "keyword_gap", ...(args as Partial<CompetitorAnalysisInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_competitor_content_gap") {
        const report = runCompetitorContentGap({ mode: "content_gap", ...(args as Partial<CompetitorAnalysisInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_competitor_backlink_gap") {
        const report = runCompetitorBacklinkGap({ mode: "backlink_gap", ...(args as Partial<CompetitorAnalysisInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_serp_analysis") {
        const report = runCompetitorSerpAnalysis({ mode: "serp", ...(args as Partial<CompetitorAnalysisInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_seo_plan") {
        const report = runSEOPlan({ mode: "seo_plan", ...(args as Partial<SEOStrategyInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_seo_strategy") {
        const report = runSEOStrategy({ mode: "strategy", ...(args as Partial<SEOStrategyInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_campaign_plan") {
        const report = runCampaignPlan({ mode: "campaign", ...(args as Partial<SEOStrategyInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_opportunity_plan") {
        const report = runOpportunityPlan({ mode: "opportunity", ...(args as Partial<SEOStrategyInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_launch_checklist") {
        const report = runLaunchChecklist({ mode: "launch", ...(args as Partial<SEOStrategyInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      if (name === "seo_master_migration_plan") {
        const report = runMigrationPlan({ mode: "migration", ...(args as Partial<SEOStrategyInput>) });
        send({ jsonrpc: "2.0", id, result: resultText(JSON.stringify(report, null, 2)) });
        return;
      }
      throw new Error(`Unknown tool: ${name}`);
    }

    if (method === "resources/list") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          resources: [
            { uri: "seo-master://memory", name: "Master of SEO Memory", mimeType: "application/json" },
            { uri: "seo-master://commands", name: "Master of SEO Commands", mimeType: "application/json" },
            { uri: "seo-master://groups", name: "Master of SEO Groups", mimeType: "application/json" },
            { uri: "seo-master://technical-rules", name: "Master of SEO Technical Rules", mimeType: "application/json" },
            { uri: "seo-master://performance-rules", name: "Master of SEO Performance Rules", mimeType: "application/json" },
            { uri: "seo-master://on-page-rules", name: "Master of SEO On-Page Rules", mimeType: "application/json" },
            { uri: "seo-master://keyword-rules", name: "Master of SEO Keyword Rules", mimeType: "application/json" },
            { uri: "seo-master://content-rules", name: "Master of SEO Content Rules", mimeType: "application/json" },
            { uri: "seo-master://architecture-rules", name: "Master of SEO Architecture Rules", mimeType: "application/json" },
            { uri: "seo-master://internal-linking-rules", name: "Master of SEO Internal Linking Rules", mimeType: "application/json" },
            { uri: "seo-master://schema-rules", name: "Master of SEO Schema Rules", mimeType: "application/json" },
            { uri: "seo-master://entity-seo-rules", name: "Master of SEO Entity SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://media-rules", name: "Master of SEO Media Rules", mimeType: "application/json" },
            { uri: "seo-master://image-seo-rules", name: "Master of SEO Image SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://video-seo-rules", name: "Master of SEO Video SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://ecommerce-rules", name: "Master of SEO Ecommerce Rules", mimeType: "application/json" },
            { uri: "seo-master://product-seo-rules", name: "Master of SEO Product SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://category-seo-rules", name: "Master of SEO Category SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://faceted-navigation-rules", name: "Master of SEO Faceted Navigation Rules", mimeType: "application/json" },
            { uri: "seo-master://local-seo-rules", name: "Master of SEO Local SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://international-seo-rules", name: "Master of SEO International SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://hreflang-rules", name: "Master of SEO Hreflang Rules", mimeType: "application/json" },
            { uri: "seo-master://ai-search-rules", name: "Master of SEO AI Search Rules", mimeType: "application/json" },
            { uri: "seo-master://discover-seo-rules", name: "Master of SEO Discover SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://answer-block-rules", name: "Master of SEO Answer Block Rules", mimeType: "application/json" },
            { uri: "seo-master://ai-content-quality-rules", name: "Master of SEO AI Content Quality Rules", mimeType: "application/json" },
            { uri: "seo-master://trust-rules", name: "Master of SEO Trust Rules", mimeType: "application/json" },
            { uri: "seo-master://eeat-rules", name: "Master of SEO E-E-A-T Rules", mimeType: "application/json" },
            { uri: "seo-master://security-rules", name: "Master of SEO Security Rules", mimeType: "application/json" },
            { uri: "seo-master://accessibility-rules", name: "Master of SEO Accessibility Rules", mimeType: "application/json" },
            { uri: "seo-master://cms-framework-rules", name: "Master of SEO CMS Framework Rules", mimeType: "application/json" },
            { uri: "seo-master://wordpress-seo-rules", name: "Master of SEO WordPress SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://react-seo-rules", name: "Master of SEO React SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://nextjs-seo-rules", name: "Master of SEO Next.js SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://build-seo-rules", name: "Master of SEO Build SEO Rules", mimeType: "application/json" },
            { uri: "seo-master://website-audit-rules", name: "Master of SEO Website Audit Rules", mimeType: "application/json" },
            { uri: "seo-master://audit-category-weights", name: "Master of SEO Audit Category Weights", mimeType: "application/json" },
            { uri: "seo-master://audit-roadmap-rules", name: "Master of SEO Audit Roadmap Rules", mimeType: "application/json" },
            { uri: "seo-master://competitor-rules", name: "Master of SEO Competitor Rules", mimeType: "application/json" },
            { uri: "seo-master://competitor-keyword-gap-rules", name: "Master of SEO Competitor Keyword Gap Rules", mimeType: "application/json" },
            { uri: "seo-master://competitor-content-gap-rules", name: "Master of SEO Competitor Content Gap Rules", mimeType: "application/json" },
            { uri: "seo-master://competitor-backlink-gap-rules", name: "Master of SEO Competitor Backlink Gap Rules", mimeType: "application/json" },
            { uri: "seo-master://competitor-serp-rules", name: "Master of SEO Competitor SERP Rules", mimeType: "application/json" },
            { uri: "seo-master://strategy-rules", name: "Master of SEO Strategy Rules", mimeType: "application/json" },
            { uri: "seo-master://seo-plan-rules", name: "Master of SEO Plan Rules", mimeType: "application/json" },
            { uri: "seo-master://campaign-planning-rules", name: "Master of SEO Campaign Planning Rules", mimeType: "application/json" },
            { uri: "seo-master://launch-checklist-rules", name: "Master of SEO Launch Checklist Rules", mimeType: "application/json" },
            { uri: "seo-master://migration-plan-rules", name: "Master of SEO Migration Plan Rules", mimeType: "application/json" }
          ]
        }
      });
      return;
    }

    if (method === "resources/read") {
      const uri = String(params.uri ?? "");
      send({ jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "application/json", text: await readResource(uri) }] } });
      return;
    }

    if (method === "prompts/list") {
      send({ jsonrpc: "2.0", id, result: { prompts } });
      return;
    }

    if (method === "prompts/get") {
      const promptName = String(params.name ?? "");
      const commandByPrompt: Record<string, string> = {
        "seo-master-migration-plan": "/seo-master migration-plan",
        "seo-master-launch-checklist": "/seo-master launch-checklist",
        "seo-master-campaign-plan": "/seo-master seo-campaign-plan",
        "seo-master-seo-strategy": "/seo-master seo-strategy",
        "seo-master-seo-plan": "/seo-master seo-plan",
        "seo-master-serp-analysis": "/seo-master serp-analysis",
        "seo-master-competitor-backlink-gap": "/seo-master competitor-backlink-gap",
        "seo-master-competitor-content-gap": "/seo-master competitor-content-gap",
        "seo-master-competitor-keyword-gap": "/seo-master competitor-keyword-gap",
        "seo-master-competitor-analysis": "/seo-master competitor-analysis",
        "seo-master-full-audit": "/seo-master full-audit",
        "seo-master-page-audit": "/seo-master page-audit",
        "seo-master-website-audit": "/seo-master website-audit",
        "seo-master-build-seo-check": "/seo-master build-seo-check",
        "seo-master-static-seo-audit": "/seo-master static-seo-audit",
        "seo-master-nextjs-seo-audit": "/seo-master nextjs-seo-audit",
        "seo-master-react-seo-audit": "/seo-master react-seo-audit",
        "seo-master-wordpress-seo-audit": "/seo-master wordpress-seo-audit",
        "seo-master-framework-seo-audit": "/seo-master framework-seo-audit",
        "seo-master-accessibility-audit": "/seo-master accessibility-audit",
        "seo-master-security-audit": "/seo-master security-audit",
        "seo-master-eeat-audit": "/seo-master eeat-audit",
        "seo-master-trust-audit": "/seo-master trust-audit",
        "seo-master-ai-content-quality-audit": "/seo-master ai-content-quality-audit",
        "seo-master-discover-seo-audit": "/seo-master discover-seo-audit",
        "seo-master-answer-block-audit": "/seo-master answer-block-audit",
        "seo-master-ai-search-audit": "/seo-master ai-search-audit",
        "seo-master-hreflang-audit": "/seo-master hreflang-audit",
        "seo-master-international-seo-audit": "/seo-master international-seo-audit",
        "seo-master-local-seo-audit": "/seo-master local-seo-audit",
        "seo-master-category-seo-audit": "/seo-master category-seo-audit",
        "seo-master-product-seo-audit": "/seo-master product-seo-audit",
        "seo-master-ecommerce-audit": "/seo-master ecommerce-audit",
        "seo-master-video-seo-audit": "/seo-master video-seo-audit",
        "seo-master-image-seo-audit": "/seo-master image-seo-audit",
        "seo-master-media-audit": "/seo-master media-audit",
        "seo-master-schema-generate": "/seo-master schema-generate",
        "seo-master-schema-audit": "/seo-master schema-audit",
        "seo-master-internal-linking-audit": "/seo-master internal-linking-audit",
        "seo-master-architecture-audit": "/seo-master architecture-audit",
        "seo-master-content-plan": "/seo-master content-plan",
        "seo-master-keyword-research": "/seo-master keyword-research",
        "seo-master-on-page-audit": "/seo-master on-page-audit",
        "seo-master-performance-audit": "/seo-master performance-audit",
        "seo-master-technical-audit": "/seo-master technical-audit",
        "seo-master-audit": "/seo-master audit-website"
      };
      send({
        jsonrpc: "2.0",
        id,
        result: {
          description: `${promptName} planned-module prompt`,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: commandByPrompt[promptName] ?? "/seo-master help"
              }
            }
          ]
        }
      });
      return;
    }

    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (error: unknown) {
    send({ jsonrpc: "2.0", id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) } });
  }
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/u);
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    if (line.trim()) void handle(JSON.parse(line) as JsonRpcRequest);
  }
});
