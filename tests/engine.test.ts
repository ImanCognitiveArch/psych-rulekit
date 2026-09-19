import assert from "node:assert/strict";
import test from "node:test";
import { evaluateRule, evaluateRulePack, validateRulePack } from "../src/index.js";
import type { RulePack } from "../src/index.js";
import { syntheticStressLoopPack } from "../examples/synthetic-stress-loop.js";

const fullMatch = {
  trigger_present: true,
  worry_present: true,
  rumination_present: false,
  threat_monitoring_present: true,
  coping_control_present: false,
  impact_present: true,
  duration_days: 10,
  outside_scope: false,
} as const;

test("returns criteria_met for a complete matching assessment", () => {
  const result = evaluateRulePack(syntheticStressLoopPack, { facts: fullMatch });
  assert.equal(result.disposition, "criteria_met");
  assert.deepEqual(result.missingFactIds, []);
});

test("returns criteria_not_met when a required gate fails", () => {
  const result = evaluateRulePack(syntheticStressLoopPack, {
    facts: { ...fullMatch, trigger_present: false },
  });
  assert.equal(result.disposition, "criteria_not_met");
});

test("preserves unknown instead of treating missing facts as false", () => {
  const { impact_present: _omitted, ...incomplete } = fullMatch;
  const result = evaluateRulePack(syntheticStressLoopPack, { facts: incomplete });
  assert.equal(result.disposition, "insufficient_information");
  assert.deepEqual(result.missingFactIds, ["impact_present"]);
});

test("returns excluded when an exclusion rule matches", () => {
  const result = evaluateRulePack(syntheticStressLoopPack, {
    facts: { ...fullMatch, outside_scope: true },
  });
  assert.equal(result.disposition, "excluded");
});

test("count rule stays unknown when missing facts could change the outcome", () => {
  const trace = evaluateRule(
    { kind: "count", id: "count", factIds: ["a", "b", "c"], atLeast: 2 },
    { a: true, b: null, c: false },
  );
  assert.equal(trace.state, "unknown");
  assert.deepEqual(trace.factIds, ["b"]);
});

test("any rule uses its explicit threshold", () => {
  const trace = evaluateRule(
    {
      kind: "any",
      id: "any",
      atLeast: 2,
      rules: [
        { kind: "fact", id: "a", factId: "a" },
        { kind: "fact", id: "b", factId: "b" },
        { kind: "fact", id: "c", factId: "c" },
      ],
    },
    { a: true, b: false, c: true },
  );
  assert.equal(trace.state, "true");
});

test("validator rejects unknown fact references", () => {
  const invalid: RulePack = {
    ...syntheticStressLoopPack,
    inclusion: { kind: "fact", id: "bad", factId: "not_defined" },
  };
  const validation = validateRulePack(invalid);
  assert.equal(validation.valid, false);
  assert.equal(validation.issues[0]?.code, "missing_reference");
});

test("validator rejects duplicate rule identifiers", () => {
  const invalid: RulePack = {
    ...syntheticStressLoopPack,
    inclusion: {
      kind: "all",
      id: "root",
      rules: [
        { kind: "fact", id: "duplicate", factId: "trigger_present" },
        { kind: "fact", id: "duplicate", factId: "impact_present" },
      ],
    },
  };
  const validation = validateRulePack(invalid);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.code === "duplicate_id"));
});
