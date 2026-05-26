import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
const ruleFiles = [
    "local-seo-rules.json",
    "google-business-profile-rules.json",
    "nap-consistency-rules.json",
    "local-landing-page-rules.json",
    "local-business-schema-rules.json",
    "local-review-rules.json",
    "citation-readiness-rules.json",
    "service-area-rules.json",
    "multi-location-rules.json",
    "international-seo-rules.json",
    "hreflang-rules.json",
    "language-country-rules.json",
    "x-default-rules.json",
    "localized-content-rules.json",
    "international-url-rules.json"
];
export async function getLocalInternationalRules() {
    const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return groups.flat();
}
//# sourceMappingURL=local-international-rules.js.map