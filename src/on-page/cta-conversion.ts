import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";

export const ctaConversionRules: OnPageRule[] = [{
  id: "cta-conversion-core",
  category: "cta-conversion",
  title: "CTA and conversion clarity",
  description: "Commercial pages should provide clear, intent-matched next actions.",
  do: ["Use clear CTAs", "Match CTA to page intent", "Include primary and secondary CTAs where useful", "Reduce friction", "Make mobile CTAs accessible"],
  dont: ["Make users search for the CTA", "Use too many competing CTAs", "Use unclear CTA text like Submit when better copy is possible", "Drive SEO traffic to a dead-end page"],
  priority: "P2",
  appliesTo: ["website", "page", "content", "on_page", "audit"],
  status: "active"
}];

export function checkCtaConversion(input: OnPageAuditInput): { issues: OnPageAuditIssue[]; passedChecks: string[] } {
  const ctas = input.ctas ?? [];
  const issues: OnPageAuditIssue[] = [];
  if (isCommercial(input) && ctas.length === 0) issues.push(issue("cta-missing-commercial-page", "Commercial page has no CTA", input.pageType === "landing" || input.pageType === "pricing" ? "P1" : "P2", "No CTA was provided or extracted.", "Add a clear CTA that matches page intent."));
  for (const cta of ctas) {
    if (/^(submit|click|go|more)$/iu.test(cta.text.trim())) issues.push(issue("cta-vague-text", "CTA text is vague", "P3", cta.text, "Use specific CTA copy such as Book a demo or Get pricing."));
  }
  if (isCommercial(input) && ctas.length > 0 && !ctas.some((cta) => cta.position === "above_fold")) issues.push(issue("cta-no-above-fold", "No above-fold CTA", "P2", "No CTA is marked above_fold.", "Place the primary CTA above the fold when relevant."));
  return { issues, passedChecks: ctas.length && !issues.length ? ["CTA checks passed."] : [] };
}

function isCommercial(input: OnPageAuditInput): boolean {
  return ["homepage", "service", "product", "landing", "pricing"].includes(input.pageType ?? "");
}

function issue(id: string, title: string, priority: "P1" | "P2" | "P3", evidence: string, howToFix: string): OnPageAuditIssue {
  return {
    id,
    category: "cta-conversion",
    title,
    priority,
    problem: evidence,
    whyItMatters: "SEO traffic needs a clear next step to produce business value.",
    howToFix,
    do: ctaConversionRules[0].do,
    dont: ctaConversionRules[0].dont,
    evidence: [evidence],
    appliesTo: ["page", "content", "on_page", "audit"]
  };
}
