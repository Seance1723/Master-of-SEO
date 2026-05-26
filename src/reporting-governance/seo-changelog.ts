export function getSeoChangelogTemplate(): Record<string, string> {
  return { date: "YYYY-MM-DD", owner: "owner", changeType: "url_change | template_change | content_change | metadata_change | robots_change | sitemap_change | migration | redesign", affectedUrls: "URLs/templates", reason: "reason", expectedImpact: "expected impact", rollbackNote: "rollback note" };
}
