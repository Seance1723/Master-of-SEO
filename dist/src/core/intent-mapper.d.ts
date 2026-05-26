import type { DetectionResult } from "../types/index.ts";
export type SearchIntent = "Informational" | "Commercial" | "Transactional" | "Navigational" | "Local" | "Comparison" | "Pricing" | "Product-led" | "Support" | "Unknown";
export declare function mapIntent(input: string): DetectionResult<SearchIntent>;
//# sourceMappingURL=intent-mapper.d.ts.map