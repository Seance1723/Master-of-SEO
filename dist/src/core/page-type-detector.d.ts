import type { DetectionResult } from "../types/index.ts";
export type PageType = "Homepage" | "Service page" | "Product page" | "Category page" | "Blog post" | "Landing page" | "Pricing page" | "Contact page" | "About page" | "Documentation page" | "Unknown";
export declare function detectPageType(input: string): DetectionResult<PageType>;
//# sourceMappingURL=page-type-detector.d.ts.map