import type { DetectionResult } from "../types/index.ts";
export type WebsiteType = "SaaS" | "Ecommerce" | "Local business" | "Blog/news" | "Corporate" | "Portfolio" | "Marketplace" | "Documentation" | "Landing page" | "Unknown";
export declare function detectWebsiteType(input: string): DetectionResult<WebsiteType>;
//# sourceMappingURL=website-type-detector.d.ts.map