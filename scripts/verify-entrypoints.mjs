/** Regression tests for all documented ESM and CommonJS entry points. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const esmRoot = await import("psych-rulekit");
const cjsRoot = require("psych-rulekit");
const esmCas = await import("psych-rulekit/cas");
const cjsCas = require("psych-rulekit/cas");
const esmApp = await import("psych-rulekit/app");
const cjsApp = require("psych-rulekit/app");

for (const [name, module] of [
  ["ESM root", esmRoot],
  ["CommonJS root", cjsRoot],
]) {
  assert.equal(typeof module.evaluateRulePack, "function", `${name} must export evaluateRulePack`);
  assert.equal(typeof module.formulateCas, "function", `${name} must export formulateCas`);
  assert.equal(typeof module.toAppEvaluationRecord, "function", `${name} must export toAppEvaluationRecord`);
}

assert.equal(typeof esmCas.formulateCas, "function");
assert.equal(typeof cjsCas.formulateCas, "function");
assert.equal(typeof esmApp.toAppEvaluationRecord, "function");
assert.equal(typeof cjsApp.toAppEvaluationRecord, "function");

console.log("Verified ESM and CommonJS package entry points.");
