import type { PriorityLabel } from "./index.ts";
import type { JsonObject } from "./schema.ts";

export type EcommercePageType = "homepage" | "category" | "product" | "collection" | "search" | "cart" | "checkout" | "account" | "wishlist" | "blog" | "landing" | "unknown";
export type ProductAvailability = "in_stock" | "out_of_stock" | "preorder" | "discontinued" | "unknown";
export type EcommerceMode = "audit" | "category" | "product" | "variants" | "faceted" | "planning";

export interface EcommerceAuditInput {
  url?: string;
  html?: string;
  page?: { url?: string; pageType?: EcommercePageType; title?: string; metaDescription?: string; h1?: string; bodyText?: string; canonicalUrl?: string; robots?: string; statusCode?: number };
  categories?: Array<{ url: string; name?: string; title?: string; description?: string; productCount?: number; bodyText?: string; canonicalUrl?: string; isIndexable?: boolean; filters?: string[]; pagination?: { currentPage?: number; totalPages?: number; hasCrawlableLinks?: boolean } }>;
  products?: Array<{ url: string; name?: string; title?: string; description?: string; sku?: string; brand?: string; price?: number; currency?: string; availability?: ProductAvailability; images?: string[]; canonicalUrl?: string; variantGroupId?: string; variants?: Array<{ url?: string; name?: string; sku?: string; attributes?: JsonObject; canonicalUrl?: string; availability?: ProductAvailability }>; reviews?: Array<{ author?: string; rating?: number; text?: string; datePublished?: string }>; aggregateRating?: { ratingValue?: number; reviewCount?: number }; schema?: JsonObject }>;
  filters?: Array<{ url: string; parameter?: string; value?: string; isIndexable?: boolean; canonicalUrl?: string; hasSearchDemand?: boolean; productCount?: number }>;
  pagination?: Array<{ url: string; pageNumber?: number; canonicalUrl?: string; hasCrawlableNextPrev?: boolean; isIndexable?: boolean }>;
  policies?: { shippingPolicyUrl?: string; returnPolicyUrl?: string; privacyPolicyUrl?: string; termsUrl?: string; contactUrl?: string; paymentSecurityInfo?: boolean };
  merchantFeed?: { productsProvided?: number; missingPriceCount?: number; missingAvailabilityCount?: number; missingImageCount?: number; missingGtinCount?: number; currencyConsistency?: boolean };
  internalLinks?: Array<{ from: string; to: string; anchorText?: string; linkType?: "navigation" | "breadcrumb" | "contextual" | "related_product" | "related_category" | "footer" | "unknown" }>;
  mode: EcommerceMode;
}

export interface EcommerceIssue {
  id: string;
  category: string;
  title: string;
  priority: PriorityLabel;
  problem: string;
  whyItMatters: string;
  howToFix: string;
  do: string[];
  dont: string[];
  evidence: string[];
  appliesTo: Array<"ecommerce" | "category" | "product" | "faceted_navigation" | "pagination" | "audit">;
}

export interface EcommerceAuditOutput {
  skill: "ecommerce-seo";
  status: "completed" | "partial" | "needs_input";
  score: number;
  summary: string;
  categoryFindings: string[];
  productFindings: string[];
  variantFindings: string[];
  facetedNavigationFindings: string[];
  paginationFindings: string[];
  trustFindings: string[];
  merchantFeedFindings: string[];
  issues: EcommerceIssue[];
  missingInputs: string[];
  nextActions: string[];
}

export interface EcommerceRule {
  id: string;
  category: string;
  title: string;
  description: string;
  do: string[];
  dont: string[];
  priority: PriorityLabel;
  appliesTo: Array<"ecommerce" | "category" | "product" | "faceted_navigation" | "pagination" | "audit">;
  status: "active" | "planned";
}
