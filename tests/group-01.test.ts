import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getPriorities } from "../src/core/priority-engine.ts";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.ts";

test("input without /seo-master stays inactive", async () => {
  const result = await runSeoMaster("audit my website");
  assert.equal(result.active, false);
  assert.equal(result.type, "inactive");
  assert.equal(result.message, "inactive");
});

test("explicit natural activation with seo-master activates", async () => {
  const result = await runSeoMaster("Check what is wrong in my site and use seo-master skills");
  assert.equal(result.active, true);
  assert.equal(result.type, "website-audit");
});

test("explicit natural activation with Master of SEO activates", async () => {
  const result = await runSeoMaster("Use Master of SEO to audit this HTML");
  assert.equal(result.active, true);
  assert.equal(result.type, "website-audit");
});

test("input / returns command menu", async () => {
  const result = await runSeoMaster("/");
  assert.equal(result.type, "menu");
  assert.match(result.message, /\/seo-master audit-website/u);
  assert.match(result.message, /Core:/u);
  assert.match(result.message, /Research & Strategy:/u);
});

test("input /random-command returns command menu", async () => {
  const result = await runSeoMaster("/random-command");
  assert.equal(result.type, "menu");
  assert.match(result.message, /\/seo-master help/u);
});

test("input /seo-master help returns help", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.equal(result.type, "help");
  assert.match(result.message, /\/seo-master keyword-research/u);
});

test("input /seo-master memory reads memory", async () => {
  const result = await runSeoMaster("/seo-master memory");
  assert.equal(result.type, "memory");
  assert.match(result.message, /Current group: Publish Approval/u);
});

test("input /seo-master next-group returns publish approval", async () => {
  const result = await runSeoMaster("/seo-master next-group");
  assert.equal(result.type, "next-group");
  assert.match(result.message, /No planned groups remain/u);
});

test("report command is active after Group 18", async () => {
  const result = await runSeoMaster("/seo-master report");
  assert.equal(result.type, "reporting-governance");
  assert.equal((result.data as { status: string }).status, "needs_input");
});

test("command registry includes required planned commands", async () => {
  const ids = (await getCommands()).map((command) => command.id);
  assert.ok(ids.includes("audit-website"));
  assert.ok(ids.includes("competitor-analysis"));
  assert.ok(ids.includes("keyword-research"));
  assert.ok(ids.includes("seo-plan"));
});

test("score weights total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("priority labels include P0, P1, P2, P3", async () => {
  const labels = (await getPriorities()).map((priority) => priority.label);
  assert.deepEqual(labels, ["P0", "P1", "P2", "P3"]);
});
