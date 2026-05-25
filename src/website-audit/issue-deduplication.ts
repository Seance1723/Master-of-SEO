import type { WebsiteAuditIssue } from "../types/website-audit.ts";
import { normalizePriority } from "./priority-normalization.ts";

export function deduplicateIssues(issues: WebsiteAuditIssue[]): WebsiteAuditIssue[] {
  const grouped = new Map<string, WebsiteAuditIssue>();
  for (const rawIssue of issues.map(normalizePriority)) {
    const key = [rawIssue.id, rawIssue.category, rawIssue.title, rawIssue.affectedTemplates?.join(",") ?? "", rawIssue.affectedPages?.join(",") ?? ""].join("|");
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { ...rawIssue, sourceSkills: rawIssue.sourceSkills ?? [rawIssue.sourceSkill] });
      continue;
    }
    grouped.set(key, {
      ...existing,
      evidence: Array.from(new Set([...existing.evidence, ...rawIssue.evidence])),
      affectedPages: Array.from(new Set([...(existing.affectedPages ?? []), ...(rawIssue.affectedPages ?? [])])),
      affectedTemplates: Array.from(new Set([...(existing.affectedTemplates ?? []), ...(rawIssue.affectedTemplates ?? [])])),
      sourceSkills: Array.from(new Set([...(existing.sourceSkills ?? [existing.sourceSkill]), rawIssue.sourceSkill, ...(rawIssue.sourceSkills ?? [])]))
    });
  }
  return [...grouped.values()];
}
