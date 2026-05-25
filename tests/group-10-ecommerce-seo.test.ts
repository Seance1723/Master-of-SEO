import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runCategorySeoAudit } from "../src/ecommerce/category-seo.ts";
import { runEcommerceAudit } from "../src/ecommerce/ecommerce-audit.ts";
import { runProductSeoAudit } from "../src/ecommerce/product-seo.ts";

test("/seo-master ecommerce-seo is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "ecommerce-seo")?.status, "active");
});

test("/seo-master ecommerce-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "ecommerce-audit")?.status, "active");
});

test("/seo-master product-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "product-seo-audit")?.status, "active");
});

test("/seo-master category-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "category-seo-audit")?.status, "active");
});

test("without input, ecommerce audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master ecommerce-seo");
  assert.equal(result.type, "ecommerce-audit");
  assert.equal((result.data as ReturnType<typeof runEcommerceAudit>).status, "needs_input");
});

test("cart/checkout/account page marked indexable returns issue", () => {
  const report = runEcommerceAudit({ mode: "audit", page: { pageType: "checkout", robots: "index" } });
  assert.ok(report.issues.some((issue) => issue.id === "private-commerce-page-indexable"));
});

test("empty indexable category returns P1/P2 issue", () => {
  const report = runCategorySeoAudit({ mode: "category", categories: [{ url: "/shoes", productCount: 0, isIndexable: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "empty-indexable-category" && ["P1", "P2"].includes(issue.priority)));
});

test("category missing description returns issue", () => {
  const report = runCategorySeoAudit({ mode: "category", categories: [{ url: "/shoes", productCount: 10 }] });
  assert.ok(report.issues.some((issue) => issue.id === "category-missing-description"));
});

test("category pagination without crawlable links returns issue", () => {
  const report = runCategorySeoAudit({ mode: "category", categories: [{ url: "/shoes", productCount: 50, pagination: { totalPages: 3, hasCrawlableLinks: false } }] });
  assert.ok(report.issues.some((issue) => issue.id === "category-pagination-not-crawlable"));
});

test("product missing name returns P1 issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe" }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-missing-name" && issue.priority === "P1"));
});

test("product missing description returns issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe" }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-missing-description"));
});

test("product missing images returns issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", description: "A useful running shoe description." }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-missing-images"));
});

test("product missing price returns issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", description: "A useful running shoe description.", images: ["/shoe.jpg"] }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-missing-price"));
});

test("product missing availability returns issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", description: "A useful running shoe description.", images: ["/shoe.jpg"], price: 99 }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-missing-availability"));
});

test("aggregateRating without reviews returns P1 issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", aggregateRating: { ratingValue: 5, reviewCount: 10 } }] });
  assert.ok(report.issues.some((issue) => issue.id === "aggregate-rating-without-reviews" && issue.priority === "P1"));
});

test("review rating outside 1-5 returns issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", reviews: [{ rating: 6 }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "review-rating-out-of-range"));
});

test("variant group without canonical strategy returns issue", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", variants: [{ url: "/p/shoe-red" }, { url: "/p/shoe-blue" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "variant-group-missing-canonical-strategy"));
});

test("indexable filter without search demand returns issue", () => {
  const report = runEcommerceAudit({ mode: "faceted", filters: [{ url: "/shoes?color=red", parameter: "color", isIndexable: true, hasSearchDemand: false, canonicalUrl: "/shoes?color=red" }] });
  assert.ok(report.issues.some((issue) => issue.id === "indexable-filter-no-demand"));
});

test("sort/order/session parameter indexable returns issue", () => {
  const report = runEcommerceAudit({ mode: "faceted", filters: [{ url: "/shoes?sort=price", parameter: "sort", isIndexable: true, hasSearchDemand: false, canonicalUrl: "/shoes" }] });
  assert.ok(report.issues.some((issue) => issue.id === "indexable-low-value-parameter"));
});

test("missing shipping policy returns issue", () => {
  const report = runEcommerceAudit({ mode: "audit", policies: { returnPolicyUrl: "/returns", contactUrl: "/contact" } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-shipping-policy"));
});

test("missing return policy returns issue", () => {
  const report = runEcommerceAudit({ mode: "audit", policies: { shippingPolicyUrl: "/shipping", contactUrl: "/contact" } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-return-policy"));
});

test("merchant feed missing price/availability/image counts return issues", () => {
  const report = runEcommerceAudit({ mode: "audit", merchantFeed: { missingPriceCount: 2, missingAvailabilityCount: 1, missingImageCount: 3 } });
  assert.ok(report.issues.some((issue) => issue.id === "merchant-feed-missing-prices"));
  assert.ok(report.issues.some((issue) => issue.id === "merchant-feed-missing-availability"));
  assert.ok(report.issues.some((issue) => issue.id === "merchant-feed-missing-images"));
});

test("currency inconsistency returns issue", () => {
  const report = runEcommerceAudit({ mode: "audit", merchantFeed: { currencyConsistency: false } });
  assert.ok(report.issues.some((issue) => issue.id === "merchant-feed-currency-inconsistent"));
});

test("product with out_of_stock recommends alternatives/accurate availability", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe", name: "Shoe", availability: "out_of_stock" }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-out-of-stock-handling" && /alternatives|availability/u.test(issue.howToFix)));
});

test("discontinued product recommends redirect/410/noindex handling", () => {
  const report = runProductSeoAudit({ mode: "product", products: [{ url: "/p/old", name: "Old Shoe", availability: "discontinued" }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-discontinued-handling" && /Redirect|410|noindex/u.test(issue.howToFix)));
});

test("/seo-master help shows ecommerce commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master ecommerce-seo\s+\[active\]/u);
  assert.match(result.message, /\/seo-master ecommerce-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master product-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master category-seo-audit\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP ecommerce tools use same logic surface", () => {
  const ecommerce = runEcommerceAudit({ mode: "audit", merchantFeed: { missingPriceCount: 1 } });
  const product = runProductSeoAudit({ mode: "product", products: [{ url: "/p/shoe" }] });
  const category = runCategorySeoAudit({ mode: "category", categories: [{ url: "/shoes", productCount: 0, isIndexable: true }] });
  assert.ok(ecommerce.issues.some((issue) => issue.id === "merchant-feed-missing-prices"));
  assert.ok(product.issues.some((issue) => issue.id === "product-missing-name"));
  assert.ok(category.issues.some((issue) => issue.id === "empty-indexable-category"));
});
