export const ACTIONS = [
  {
    name: "project-start",
    slash: "/seo-master /project-start",
    description: "Capture goals, market, audience, competitors, baseline metrics, access needs, and success criteria.",
    reference: "skills/seo-master/references/actions/project-start.md"
  },
  {
    name: "technical-audit",
    slash: "/seo-master /technical-audit",
    description: "Audit crawlability, indexation, architecture, performance, schema, canonicals, redirects, and SEO risks.",
    reference: "skills/seo-master/references/actions/technical-audit.md"
  },
  {
    name: "keyword-research",
    slash: "/seo-master /keyword-research",
    description: "Build keyword clusters by intent, funnel stage, difficulty, opportunity, and content type.",
    reference: "skills/seo-master/references/actions/keyword-research.md"
  },
  {
    name: "content-brief",
    slash: "/seo-master /content-brief",
    description: "Create SERP-aware content briefs with outline, entities, FAQs, internal links, and optimization notes.",
    reference: "skills/seo-master/references/actions/content-brief.md"
  },
  {
    name: "on-page",
    slash: "/seo-master /on-page",
    description: "Optimize titles, metas, headings, copy, images, schema, internal links, and page-level intent match.",
    reference: "skills/seo-master/references/actions/on-page.md"
  },
  {
    name: "competitor-gap",
    slash: "/seo-master /competitor-gap",
    description: "Compare competitors across rankings, content depth, SERP features, topical coverage, and links.",
    reference: "skills/seo-master/references/actions/competitor-gap.md"
  },
  {
    name: "schema-plan",
    slash: "/seo-master /schema-plan",
    description: "Recommend structured data types, required properties, validation steps, and implementation risks.",
    reference: "skills/seo-master/references/actions/schema-plan.md"
  },
  {
    name: "group-complete",
    slash: "/seo-master /group-complete",
    description: "Close a group/module by updating memory first, then README, then naming the next action.",
    reference: "skills/seo-master/references/actions/group-complete.md"
  }
];

export function formatActions() {
  return ACTIONS.map((action) => `${action.slash} - ${action.description}`).join("\n");
}

export function findAction(nameOrSlash) {
  const normalized = String(nameOrSlash || "").trim();
  return ACTIONS.find((action) => action.name === normalized || action.slash === normalized || normalized.endsWith(`/${action.name}`));
}
