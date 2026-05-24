import type { SeoRule } from "../types/index.ts";

export const coreRules: SeoRule[] = [
  {
    id: "core-trigger-gate",
    group: "group-01",
    category: "orchestration",
    title: "Require explicit /seo-master activation",
    description: "SEO orchestration must stay inactive unless the input starts with /seo-master.",
    do: ["Check trigger before routing", "Return inactive for normal text", "Return command suggestions for slash input"],
    dont: ["Run SEO audit logic from plain text", "Treat SEO mentions as activation"],
    priority: "P0",
    appliesTo: ["planning", "audit"],
    status: "active"
  },
  {
    id: "core-memory-before-next-group",
    group: "group-01",
    category: "memory",
    title: "Read memory before the next group",
    description: "Future groups must begin by reading project memory and end by updating memory and README.",
    do: ["Read memory before new group work", "Update memory after each group", "Update README after each group"],
    dont: ["Start a future group from stale assumptions"],
    priority: "P1",
    appliesTo: ["planning"],
    status: "active"
  }
];

export function getRules(status?: SeoRule["status"]): SeoRule[] {
  return status ? coreRules.filter((rule) => rule.status === status) : coreRules;
}

export function getRulesByAppliesTo(area: SeoRule["appliesTo"][number]): SeoRule[] {
  return coreRules.filter((rule) => rule.appliesTo.includes(area));
}
