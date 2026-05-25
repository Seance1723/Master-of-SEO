import { buildContentCalendar } from "./content-calendar.ts";
import { makeContentItem } from "./content-brief.ts";
import { findContentGaps } from "./content-gap.ts";
import { planContentPruning } from "./content-pruning.ts";
import { buildContentRecommendations } from "./content-recommendations.ts";
import { planContentRefresh } from "./content-refresh.ts";
import { qualityGuard } from "./content-quality-guard.ts";
import { planPillarPages } from "./pillar-page.ts";
import { planSupportingContent } from "./supporting-content.ts";
import { dedupeClusters } from "./topic-cluster.ts";
import type { ContentKeywordCluster, ContentPlanInput, ContentPlanOutput } from "../types/content.ts";

export function runContentPlan(input: ContentPlanInput): ContentPlanOutput {
  const normalized: ContentPlanInput = { ...input, mode: input.mode ?? "planning", keywordClusters: dedupeClusters(input.keywordClusters) };
  const missingInputs = getMissingInputs(normalized);
  if (!hasAnyContentInput(normalized)) return needsInput(missingInputs);

  const clusters = normalized.keywordClusters ?? [];
  const pillarPages = planPillarPages(clusters);
  const supportingPages = planSupportingContent(clusters, pillarPages);
  const contentBriefs = [...pillarPages, ...supportingPages];
  const contentGaps = findContentGaps(clusters, normalized.existingPages, normalized.competitorPages, normalized.business);
  const refreshPlan = planContentRefresh(normalized.existingPages);
  const pruningPlan = planContentPruning(normalized.existingPages);
  const contentCalendar = buildContentCalendar(pillarPages, supportingPages, refreshPlan, pruningPlan, normalized.constraints?.monthlyContentCapacity ?? 4);
  const issues = qualityGuard(normalized, contentBriefs);
  const status = missingInputs.length ? "partial" : "completed";
  return {
    skill: "content-strategy-planning",
    status,
    score: score(issues, contentGaps),
    summary: `${status === "partial" ? "Partial content strategy plan completed" : "Content strategy plan completed"}. Planned ${contentBriefs.length} content item(s), ${contentGaps.length} gap(s), ${refreshPlan.length} refresh item(s), and ${pruningPlan.length} pruning item(s).`,
    pillarPages,
    supportingPages,
    contentBriefs,
    contentGaps,
    refreshPlan,
    pruningPlan,
    contentCalendar,
    issues,
    missingInputs,
    nextActions: buildContentRecommendations(issues, contentGaps, missingInputs)
  };
}

export function parseContentPlanInputFromText(rawInput: string): ContentPlanInput {
  const input: ContentPlanInput = { mode: "planning" };
  const args = rawInput.replace(/^\/seo-master\s+content-plan\s*/u, "").trim();
  const flagPattern = /--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu;
  for (const match of args.matchAll(flagPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "business") input.business = parseJsonFlag(value, {});
    if (key === "keywordClusters" || key === "keyword-clusters") input.keywordClusters = parseJsonFlag(value, []);
    if (key === "existingPages" || key === "existing-pages") input.existingPages = parseJsonFlag(value, []);
    if (key === "competitorPages" || key === "competitor-pages") input.competitorPages = parseJsonFlag(value, []);
    if (key === "constraints") input.constraints = parseJsonFlag(value, {});
    if (key === "mode" && ["planning", "brief", "refresh", "pruning", "calendar", "audit"].includes(value)) input.mode = value as ContentPlanInput["mode"];
  }
  const plain = args.replace(flagPattern, "").trim();
  if (!input.keywordClusters?.length && plain) input.keywordClusters = plain.split(",").map((item): ContentKeywordCluster => ({ clusterName: item.trim(), primaryKeyword: item.trim(), intent: "unknown", funnelStage: "unknown", recommendedPageType: "unknown", businessValue: "unknown", difficultyLevel: "unknown" })).filter((item) => item.primaryKeyword);
  return input;
}

function needsInput(missingInputs: string[]): ContentPlanOutput {
  return { skill: "content-strategy-planning", status: "needs_input", score: 0, summary: "Needs input. Provide keyword clusters, business context, existing pages, competitor pages, or content constraints.", pillarPages: [], supportingPages: [], contentBriefs: [], contentGaps: [], refreshPlan: [], pruningPlan: [], contentCalendar: [], issues: [], missingInputs, nextActions: ["Provide keywordClusters, business services/products, existingPages, or competitorPages.", "No live SERP, traffic, competitor, or keyword metric data was fetched."] };
}

function parseJsonFlag<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function hasAnyContentInput(input: ContentPlanInput): boolean {
  return Boolean(input.keywordClusters?.length || input.existingPages?.length || input.competitorPages?.length || input.business?.services?.length || input.business?.products?.length);
}

function getMissingInputs(input: ContentPlanInput): string[] {
  const missing = [];
  if (!input.keywordClusters?.length) missing.push("keywordClusters");
  if (!input.business) missing.push("business");
  if (!input.existingPages?.length) missing.push("existingPages");
  if (!input.competitorPages?.length) missing.push("competitorPages");
  if (!input.constraints) missing.push("constraints");
  return missing;
}

function score(issues: ContentPlanOutput["issues"], gaps: ContentPlanOutput["contentGaps"]): number {
  const penalty = issues.reduce((sum, issue) => sum + ({ P0: 30, P1: 15, P2: 7, P3: 3 }[issue.priority]), 0);
  return Math.max(0, Math.min(100, 80 + Math.min(20, gaps.length * 2) - penalty));
}

export { makeContentItem };
