import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runImageSeoAudit } from "../src/media/image-seo.ts";
import { runMediaAudit } from "../src/media/media-audit.ts";
import { runVideoSeoAudit } from "../src/media/video-seo.ts";

test("/seo-master media-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "media-audit")?.status, "active");
});

test("/seo-master image-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "image-seo-audit")?.status, "active");
});

test("/seo-master video-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "video-seo-audit")?.status, "active");
});

test("without input, media audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master media-audit");
  assert.equal(result.type, "media-audit");
  assert.equal((result.data as ReturnType<typeof runMediaAudit>).status, "needs_input");
});

test("HTML image extraction works", () => {
  const report = runMediaAudit({ mode: "audit", html: '<img src="/hero.webp" alt="Hero" width="1200" height="600" srcset="/hero.webp 1200w" sizes="100vw">' });
  assert.match(report.imageFindings.join(" "), /Images reviewed: 1/u);
});

test("hero image with lazy loading returns P1 issue", () => {
  const report = runImageSeoAudit({ mode: "image", images: [{ src: "/hero.jpg", alt: "Hero", isHero: true, loading: "lazy" }] });
  assert.ok(report.issues.some((issue) => issue.id === "hero-image-lazy-loaded" && issue.priority === "P1"));
});

test("above-fold image missing alt returns issue", () => {
  const report = runImageSeoAudit({ mode: "image", images: [{ src: "/hero.webp", alt: "", position: "above_fold" }] });
  assert.ok(report.issues.some((issue) => issue.id === "image-missing-alt"));
});

test("decorative image missing alt does not return issue", () => {
  const report = runImageSeoAudit({ mode: "image", images: [{ src: "/decor.svg", isDecorative: true }] });
  assert.equal(report.issues.some((issue) => issue.id === "image-missing-alt"), false);
});

test("very large image returns P1 issue", () => {
  const report = runImageSeoAudit({ mode: "image", images: [{ src: "/large.webp", alt: "Large", sizeKb: 1200 }] });
  assert.ok(report.issues.some((issue) => issue.id === "image-very-large" && issue.priority === "P1"));
});

test("random filename returns issue", () => {
  const report = runImageSeoAudit({ mode: "image", images: [{ src: "/IMG_1234.jpg", alt: "Office" }] });
  assert.ok(report.issues.some((issue) => issue.id === "image-random-filename"));
});

test("missing width/height returns CLS risk", () => {
  const report = runImageSeoAudit({ mode: "image", images: [{ src: "/hero.webp", alt: "Hero", isHero: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "image-missing-dimensions"));
});

test("missing og:image returns issue for shareable page", () => {
  const report = runMediaAudit({ mode: "audit", page: { pageType: "article" }, images: [{ src: "/image.webp", alt: "Image" }] });
  assert.ok(report.issues.some((issue) => issue.id === "missing-og-image"));
});

test("video missing transcript returns issue", () => {
  const report = runVideoSeoAudit({ mode: "video", videos: [{ title: "Demo", hasTranscript: false, hasCaptions: true, thumbnailUrl: "/thumb.jpg" }] });
  assert.ok(report.issues.some((issue) => issue.id === "video-missing-transcript"));
});

test("video missing captions returns issue", () => {
  const report = runVideoSeoAudit({ mode: "video", videos: [{ title: "Demo", hasTranscript: true, hasCaptions: false, thumbnailUrl: "/thumb.jpg" }] });
  assert.ok(report.issues.some((issue) => issue.id === "video-missing-captions"));
});

test("video missing thumbnail returns issue", () => {
  const report = runVideoSeoAudit({ mode: "video", videos: [{ title: "Demo", hasTranscript: true, hasCaptions: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "video-missing-thumbnail"));
});

test("visible video without VideoObject schema returns recommendation", () => {
  const report = runVideoSeoAudit({ mode: "video", videos: [{ title: "Demo", thumbnailUrl: "/thumb.jpg", hasTranscript: true, hasCaptions: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "visible-video-missing-videoobject"));
});

test("VideoObject without visible video evidence returns issue", () => {
  const report = runMediaAudit({ mode: "audit", schema: { jsonLd: [{ "@context": "https://schema.org", "@type": "VideoObject", name: "Demo" }] } });
  assert.ok(report.issues.some((issue) => issue.id === "videoobject-without-visible-video"));
});

test("autoplay video with sound returns issue when detectable", () => {
  const report = runMediaAudit({ mode: "audit", html: "<video autoplay src='/demo.mp4'></video>" });
  assert.ok(report.issues.some((issue) => issue.id === "autoplay-video-with-sound"));
});

test("/seo-master help shows media commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master media-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master image-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master video-seo-audit\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP media tools use same logic surface", () => {
  const media = runMediaAudit({ mode: "audit", images: [{ src: "/large.webp", alt: "Large", sizeKb: 1200 }] });
  const image = runImageSeoAudit({ mode: "image", images: [{ src: "/large.webp", alt: "Large", sizeKb: 1200 }] });
  const video = runVideoSeoAudit({ mode: "video", videos: [{ title: "Demo", hasTranscript: false }] });
  assert.ok(media.issues.some((issue) => issue.id === "image-very-large"));
  assert.ok(image.issues.some((issue) => issue.id === "image-very-large"));
  assert.ok(video.issues.some((issue) => issue.id === "video-missing-transcript"));
});
