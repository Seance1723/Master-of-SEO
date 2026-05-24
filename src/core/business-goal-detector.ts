import type { DetectionResult } from "../types/index.ts";

export type BusinessGoal = "Lead generation" | "Sales" | "Demo booking" | "Signup" | "Brand awareness" | "Content traffic" | "Local visits" | "Support/self-service" | "Unknown";

const signals: Record<Exclude<BusinessGoal, "Unknown">, string[]> = {
  "Lead generation": ["lead", "inquiry", "quote", "form"],
  "Sales": ["sales", "revenue", "purchase", "checkout"],
  "Demo booking": ["demo", "book a call", "schedule"],
  "Signup": ["signup", "sign up", "register", "trial"],
  "Brand awareness": ["brand", "awareness", "visibility"],
  "Content traffic": ["traffic", "blog", "readers", "newsletter"],
  "Local visits": ["local", "visit", "directions", "near me"],
  "Support/self-service": ["support", "help center", "self-service", "docs"]
};

export function detectBusinessGoal(input: string): DetectionResult<BusinessGoal> {
  const haystack = input.toLowerCase();
  let best: DetectionResult<BusinessGoal> = { type: "Unknown", confidence: 0, matchedSignals: [] };
  for (const [type, keywords] of Object.entries(signals)) {
    const matchedSignals = keywords.filter((keyword) => haystack.includes(keyword));
    if (matchedSignals.length > best.matchedSignals.length) best = { type: type as BusinessGoal, confidence: Math.min(0.95, 0.45 + matchedSignals.length * 0.15), matchedSignals };
  }
  return best;
}
