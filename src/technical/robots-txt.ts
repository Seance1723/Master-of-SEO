import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const robotsTxtRules: TechnicalRule[] = [
  {
    id: "robots-txt-core",
    category: "robots.txt",
    title: "Robots.txt crawl control",
    description: "Robots.txt should control crawl access without hiding private content or blocking critical resources.",
    do: ["Use robots.txt for crawl control", "Include sitemap location", "Test robots rules"],
    dont: ["Use robots.txt to hide private content", "Block pages that need Google to see noindex", "Accidentally block the full site", "Block important resources needed for rendering"],
    priority: "P0",
    appliesTo: ["website", "technical", "audit"],
    status: "active"
  }
];

export function checkRobotsTxt(input: TechnicalAuditInput): { issues: TechnicalAuditIssue[]; passedChecks: string[] } {
  const issues: TechnicalAuditIssue[] = [];
  const passedChecks: string[] = [];
  const robotsTxt = input.robotsTxt;
  if (!robotsTxt) return { issues, passedChecks };

  if (/^\s*disallow\s*:\s*\/\s*$/imu.test(robotsTxt)) {
    issues.push({
      id: "robots-full-site-block",
      category: "robots.txt",
      title: "Robots.txt blocks the full site",
      priority: "P0",
      problem: "robots.txt contains Disallow: /.",
      whyItMatters: "A full-site block can prevent crawlers from accessing important pages.",
      howToFix: "Remove the global disallow unless the site should not be crawled.",
      do: robotsTxtRules[0].do,
      dont: robotsTxtRules[0].dont,
      evidence: ["Disallow: /"],
      appliesTo: ["website", "technical", "audit"]
    });
  } else {
    passedChecks.push("No full-site robots.txt block found.");
  }

  if (/^\s*sitemap\s*:/imu.test(robotsTxt)) {
    passedChecks.push("robots.txt declares a sitemap location.");
  } else {
    issues.push({
      id: "robots-missing-sitemap",
      category: "robots.txt",
      title: "Missing sitemap declaration",
      priority: "P3",
      problem: "robots.txt does not declare a sitemap location.",
      whyItMatters: "Sitemap declarations help crawlers discover XML sitemaps.",
      howToFix: "Add a Sitemap: directive pointing to the XML sitemap.",
      do: robotsTxtRules[0].do,
      dont: robotsTxtRules[0].dont,
      evidence: ["No Sitemap: directive found"],
      appliesTo: ["website", "technical", "audit"]
    });
  }

  if (/disallow\s*:\s*\/(products?|services?|blog|resources|static|assets|images?|css|js)\b/imu.test(robotsTxt)) {
    issues.push({
      id: "robots-important-path-block",
      category: "robots.txt",
      title: "Potential important path blocked",
      priority: "P1",
      problem: "robots.txt appears to block a common important path or rendering resource.",
      whyItMatters: "Blocking important content or resources can harm crawling, rendering, and indexing.",
      howToFix: "Review the blocked path and allow it if it is needed for SEO or rendering.",
      do: robotsTxtRules[0].do,
      dont: robotsTxtRules[0].dont,
      evidence: ["Common important path/resource appears in Disallow rule"],
      appliesTo: ["website", "technical", "audit"]
    });
  }

  return { issues, passedChecks };
}
