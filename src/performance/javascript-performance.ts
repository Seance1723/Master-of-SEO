import type { PerformanceAsset, PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";

export const javascriptPerformanceRules: PerformanceRule[] = [
  {
    id: "javascript-performance-core",
    category: "javascript-performance",
    title: "JavaScript performance",
    description: "JavaScript should be minimal, deferred where possible, and split by need.",
    do: ["Defer or async non-critical JS", "Remove unused JS", "Code-split where useful", "Avoid hydration bloat"],
    dont: ["Load full app bundles for static pages", "Place non-critical scripts in head", "Run heavy animations on page load"],
    priority: "P1",
    appliesTo: ["website", "page", "performance", "audit"],
    status: "active"
  }
];

export function checkJavaScriptPerformance(input: PerformanceAuditInput): { issues: PerformanceAuditIssue[]; passedChecks: string[] } {
  const issues: PerformanceAuditIssue[] = [];
  const scripts = (input.assets ?? []).filter((asset) => asset.type === "script" || asset.type === "third_party");
  for (const asset of scripts) {
    if (asset.loading === "blocking" && asset.position === "above_fold") issues.push(issue("js-blocking-head", "Blocking script near page start", "P1", asset, "Script is marked blocking above the fold."));
    else if (asset.loading === "blocking") issues.push(issue("js-blocking", "Blocking script", "P2", asset, "Script is marked blocking."));
    if ((asset.sizeKb ?? 0) > 1000) issues.push(issue("js-very-large", "Very large JavaScript asset", "P1", asset, `Script is ${asset.sizeKb}KB.`));
    else if ((asset.sizeKb ?? 0) > 300) issues.push(issue("js-large", "Large JavaScript asset", "P2", asset, `Script is ${asset.sizeKb}KB.`));
    if (asset.type === "third_party") issues.push(issue("third-party-script-review", "Third-party script needs review", "P3", asset, "Third-party script is present."));
  }

  const htmlScriptCount = (input.html?.match(/<script\b/giu) ?? []).length;
  if (htmlScriptCount > 20) issues.push(htmlIssue("html-many-scripts", "Many script tags", "P2", `${htmlScriptCount} script tags found.`));

  return { issues, passedChecks: scripts.length && !issues.length ? ["JavaScript asset checks passed."] : [] };
}

function issue(id: string, title: string, priority: "P1" | "P2" | "P3", asset: PerformanceAsset, evidence: string): PerformanceAuditIssue {
  return {
    id,
    category: "javascript-performance",
    title,
    priority,
    problem: evidence,
    whyItMatters: "JavaScript can delay rendering, block the main thread, and worsen INP.",
    howToFix: "Remove unused JavaScript, split bundles, and defer non-critical scripts.",
    do: javascriptPerformanceRules[0].do,
    dont: javascriptPerformanceRules[0].dont,
    evidence: [asset.url, evidence],
    appliesTo: ["website", "page", "performance", "audit"]
  };
}

function htmlIssue(id: string, title: string, priority: "P2", evidence: string): PerformanceAuditIssue {
  return {
    id,
    category: "javascript-performance",
    title,
    priority,
    problem: evidence,
    whyItMatters: "Many script tags can increase parse, network, and execution overhead.",
    howToFix: "Audit script necessity and defer non-critical scripts.",
    do: javascriptPerformanceRules[0].do,
    dont: javascriptPerformanceRules[0].dont,
    evidence: [evidence],
    appliesTo: ["page", "performance", "audit"]
  };
}
