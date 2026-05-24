import type { TechnicalRule } from "../types/technical.ts";

export const spamPolicyRules: TechnicalRule[] = [
  {
    id: "spam-policy-compliance",
    category: "spam-policy",
    title: "Spam policy compliance",
    description: "Avoid manipulative tactics that can reduce visibility or trigger manual action.",
    do: ["Build content for users", "Make page content visible and consistent for users and crawlers"],
    dont: ["Use cloaking", "Use hidden text", "Use keyword stuffing", "Create doorway pages", "Publish mass low-value AI content", "Use scraped content"],
    priority: "P0",
    appliesTo: ["website", "page", "content", "audit"],
    status: "active"
  }
];
