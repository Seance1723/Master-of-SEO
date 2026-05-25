#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { runArchitectureAudit } from "../architecture/architecture-audit.ts";
import { getArchitectureRules } from "../architecture/architecture-rules.ts";
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
import { runTechnicalAudit } from "../technical/technical-audit.ts";
import { getTechnicalRules } from "../technical/technical-rules.ts";
import type { ContentPlanInput } from "../types/content.ts";
import type { ArchitectureAuditInput } from "../types/architecture.ts";
import type { EcommerceAuditInput } from "../types/ecommerce.ts";
import type { KeywordResearchInput } from "../types/keywords.ts";
import type { MediaAuditInput } from "../types/media.ts";
import type { OnPageAuditInput } from "../types/on-page.ts";
import type { PerformanceAuditInput } from "../types/performance.ts";
import type { SchemaAuditInput } from "../types/schema.ts";
import type { TechnicalAuditInput } from "../types/technical.ts";

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
  }
];

const prompts = [
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
            { uri: "seo-master://faceted-navigation-rules", name: "Master of SEO Faceted Navigation Rules", mimeType: "application/json" }
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
        "seo-master-audit": "/seo-master audit-website",
        "seo-master-competitor-analysis": "/seo-master competitor-analysis",
        "seo-master-seo-plan": "/seo-master seo-plan"
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
