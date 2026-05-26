import type { DetectionResult } from "../types/index.ts";
export type BusinessGoal = "Lead generation" | "Sales" | "Demo booking" | "Signup" | "Brand awareness" | "Content traffic" | "Local visits" | "Support/self-service" | "Unknown";
export declare function detectBusinessGoal(input: string): DetectionResult<BusinessGoal>;
//# sourceMappingURL=business-goal-detector.d.ts.map