#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCommandMenu } from "../core/command-registry.ts";
import { runSeoMaster } from "../core/orchestrator.ts";
import { dataDir, memoryPath } from "../core/paths.ts";
import { runKeywordResearch } from "../keywords/keyword-research.ts";
import { getKeywordRules } from "../keywords/keyword-rules.ts";
import { runOnPageAudit } from "../on-page/on-page-audit.ts";
import { getOnPageRules } from "../on-page/on-page-rules.ts";
import { runPerformanceAudit } from "../performance/performance-audit.ts";
import { getPerformanceRules } from "../performance/performance-rules.ts";
import { runTechnicalAudit } from "../technical/technical-audit.ts";
import { getTechnicalRules } from "../technical/technical-rules.ts";
import type { KeywordResearchInput } from "../types/keywords.ts";
import type { OnPageAuditInput } from "../types/on-page.ts";
import type { PerformanceAuditInput } from "../types/performance.ts";
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
  }
];

const prompts = [
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
            { uri: "seo-master://keyword-rules", name: "Master of SEO Keyword Rules", mimeType: "application/json" }
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
