import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.js";
import { runSeoMaster } from "../src/core/orchestrator.js";
import { getPriorities } from "../src/core/priority-engine.js";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.js";
test("input without /seo-master stays inactive", async () => {
    const result = await runSeoMaster("audit my website");
    assert.equal(result.active, false);
    assert.equal(result.type, "inactive");
    assert.equal(result.message, "inactive");
});
test("input / returns command menu", async () => {
    const result = await runSeoMaster("/");
    assert.equal(result.type, "menu");
    assert.match(result.message, /\/seo-master audit-website/u);
});
test("input /seo-master help returns help", async () => {
    const result = await runSeoMaster("/seo-master help");
    assert.equal(result.type, "help");
    assert.match(result.message, /\/seo-master keyword-research/u);
});
test("input /seo-master memory reads memory", async () => {
    const result = await runSeoMaster("/seo-master memory");
    assert.equal(result.type, "memory");
    assert.match(result.message, /Current group: Technical SEO/u);
});
test("input /seo-master next-group returns Group 2", async () => {
    const result = await runSeoMaster("/seo-master next-group");
    assert.equal(result.type, "next-group");
    assert.match(result.message, /Technical SEO \(group-02\)/u);
});
test("planned command returns planned-module response", async () => {
    const result = await runSeoMaster("/seo-master audit-website https://example.com");
    assert.equal(result.type, "planned");
    assert.match(result.message, /not implemented yet/u);
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
//# sourceMappingURL=group-01.test.js.map