import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_EVALUATION_TABLE_SQL,
  evaluateRulePack,
  toAppEvaluationRecord,
} from "../src/index.js";
import { syntheticStressLoopPack } from "../examples/synthetic-stress-loop.js";

test("app adapter emits a deterministic privacy-minimizing record", () => {
  const evaluation = evaluateRulePack(syntheticStressLoopPack, {
    facts: {
      trigger_present: true,
      worry_present: true,
      rumination_present: true,
      threat_monitoring_present: false,
      coping_control_present: false,
      impact_present: true,
      duration_days: 8,
      outside_scope: false,
    },
  });
  const first = toAppEvaluationRecord(evaluation, "2026-09-19T00:00:00.000Z", true);
  const second = toAppEvaluationRecord(evaluation, "2026-09-19T00:00:00.000Z", true);
  assert.deepEqual(first, second);
  assert.equal(first.safety.isDiagnosis, false);
  assert.equal(first.isDemo, true);
  assert.equal("facts" in first, false);
});

test("SQLite migration separates demo data from real data", () => {
  assert.match(APP_EVALUATION_TABLE_SQL, /is_demo/);
  assert.match(APP_EVALUATION_TABLE_SQL, /insufficient_information/);
});
