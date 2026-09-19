import assert from "node:assert/strict";
import test from "node:test";
import { formulateCas, type CasFormulationInput } from "../src/index.js";

const completeInput: CasFormulationInput = {
  formulationId: "cas_demo_01",
  trigger: { id: "trigger_1", summary: "An intrusive image appeared." },
  positiveMetacognitiveBeliefs: [
    { id: "positive_1", summary: "Monitoring may prevent a bad outcome." },
  ],
  negativeMetacognitiveBeliefs: [
    { id: "negative_1", summary: "The thinking may be uncontrollable." },
  ],
  extendedThinking: {
    worry: [{ id: "worry_1", summary: "Repeated future-oriented scenarios." }],
    rumination: [],
  },
  threatMonitoring: [{ id: "monitor_1", summary: "Attention narrowed to threat cues." }],
  copingResponses: [{ id: "coping_1", summary: "Repeated reassurance seeking." }],
  consequences: [{ id: "consequence_1", summary: "Distress and attentional inflexibility persisted." }],
  alternativeResponses: [{ id: "alternative_1", summary: "Detached observation of the thought." }],
};

test("CAS formulation creates an explicit maintenance loop", () => {
  const result = formulateCas(completeInput);
  assert.equal(result.completeness, "complete");
  assert.ok(result.edges.some((edge) => edge.relation === "reinforces"));
  assert.ok(result.edges.some((edge) => edge.relation === "interrupts"));
  assert.equal(result.nodes[0]?.kind, "trigger");
});

test("CAS formulation reports missing process sections", () => {
  const result = formulateCas({
    ...completeInput,
    positiveMetacognitiveBeliefs: [],
    negativeMetacognitiveBeliefs: [],
    threatMonitoring: [],
    copingResponses: [],
    extendedThinking: { worry: [], rumination: [] },
  });
  assert.equal(result.completeness, "limited");
  assert.ok(result.missingSections.includes("CAS strategies"));
});
