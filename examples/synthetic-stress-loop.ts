/**
 * Synthetic rule pack used to demonstrate the engine without redistributing a
 * diagnostic manual or claiming clinical validity.
 */
import type { RulePack } from "../src/index.js";

export const syntheticStressLoopPack: RulePack = {
  schemaVersion: "1.0.0",
  id: "example.synthetic_stress_loop",
  title: "Synthetic stress-loop research example",
  version: "1.0.0",
  description: "Demonstrates gates, counts, duration, exclusions, and unknown-state handling.",
  intendedUse: "education",
  locale: "en",
  facts: [
    { id: "trigger_present", label: "Trigger identified", valueType: "boolean" },
    { id: "worry_present", label: "Worry process observed", valueType: "boolean" },
    { id: "rumination_present", label: "Rumination process observed", valueType: "boolean" },
    { id: "threat_monitoring_present", label: "Threat monitoring observed", valueType: "boolean" },
    { id: "coping_control_present", label: "Control-oriented coping observed", valueType: "boolean" },
    { id: "impact_present", label: "Meaningful impact reported", valueType: "boolean" },
    { id: "duration_days", label: "Observed duration", valueType: "number", unit: "day" },
    { id: "outside_scope", label: "Outside this example's scope", valueType: "boolean" }
  ],
  inclusion: {
    kind: "all",
    id: "inclusion.root",
    rules: [
      { kind: "fact", id: "inclusion.trigger", factId: "trigger_present" },
      {
        kind: "count",
        id: "inclusion.process_count",
        factIds: ["worry_present", "rumination_present", "threat_monitoring_present", "coping_control_present"],
        atLeast: 2
      },
      { kind: "compare", id: "inclusion.duration", factId: "duration_days", operator: "gte", value: 7 },
      { kind: "fact", id: "inclusion.impact", factId: "impact_present" }
    ]
  },
  exclusion: { kind: "fact", id: "exclusion.outside_scope", factId: "outside_scope" },
  evidence: [
    {
      id: "synthetic-fixture",
      citation: "PsychRuleKit synthetic educational fixture; not a clinical criterion set.",
      permissionStatus: "open",
      license: "MIT"
    }
  ],
  review: { status: "draft", notes: "Synthetic example only." },
  license: "MIT"
};
