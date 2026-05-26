import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
export async function getTrustSecurityAccessibilityRules() {
    const files = [
        "trust-rules.json",
        "eeat-rules.json",
        "author-trust-rules.json",
        "organization-trust-rules.json",
        "trust-page-rules.json",
        "legal-policy-rules.json",
        "review-authenticity-rules.json",
        "security-seo-rules.json",
        "https-mixed-content-rules.json",
        "form-safety-rules.json",
        "accessibility-rules.json",
        "semantic-html-rules.json",
        "heading-accessibility-rules.json",
        "form-accessibility-rules.json",
        "contrast-readability-rules.json"
    ];
    const groups = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return groups.flat();
}
//# sourceMappingURL=trust-security-accessibility-rules.js.map