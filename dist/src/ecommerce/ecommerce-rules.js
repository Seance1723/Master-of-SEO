import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "../core/paths.js";
const ruleFiles = [
    "ecommerce-rules.json",
    "ecommerce-category-rules.json",
    "product-seo-rules.json",
    "product-variant-rules.json",
    "review-rating-rules.json",
    "faceted-navigation-rules.json",
    "ecommerce-pagination-rules.json",
    "stock-discontinued-rules.json",
    "ecommerce-trust-rules.json",
    "merchant-feed-rules.json"
];
export async function getEcommerceRules() {
    const groups = await Promise.all(ruleFiles.map(async (file) => JSON.parse(await readFile(join(dataDir, file), "utf8"))));
    return groups.flat();
}
//# sourceMappingURL=ecommerce-rules.js.map