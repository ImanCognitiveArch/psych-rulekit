/**
 * Structured formulation for the Cognitive Attentional Syndrome (CAS).
 *
 * This is a process map for research/education. It does not infer a disorder,
 * prescribe treatment, or replace a therapist's formulation.
 */

export interface CasItem {
  readonly id: string;
  readonly summary: string;
  readonly evidence?: readonly string[];
  readonly confidence?: "low" | "moderate" | "high";
}

export interface CasFormulationInput {
  readonly formulationId: string;
  readonly trigger: CasItem;
  readonly positiveMetacognitiveBeliefs: readonly CasItem[];
  readonly negativeMetacognitiveBeliefs: readonly CasItem[];
  readonly extendedThinking: {
    readonly worry: readonly CasItem[];
    readonly rumination: readonly CasItem[];
  };
  readonly threatMonitoring: readonly CasItem[];
  readonly copingResponses: readonly CasItem[];
  readonly consequences: readonly CasItem[];
  readonly alternativeResponses?: readonly CasItem[];
}

export type CasNodeKind =
  | "trigger"
  | "positive_metacognitive_belief"
  | "negative_metacognitive_belief"
  | "worry"
  | "rumination"
  | "threat_monitoring"
  | "coping_response"
  | "consequence"
  | "alternative_response";

export interface CasNode extends CasItem {
  readonly kind: CasNodeKind;
}

export interface CasEdge {
  readonly from: string;
  readonly to: string;
  readonly relation: "activates" | "maintains" | "reinforces" | "interrupts";
}

export interface CasFormulation {
  readonly schemaVersion: "1.0.0";
  readonly formulationId: string;
  readonly nodes: readonly CasNode[];
  readonly edges: readonly CasEdge[];
  readonly completeness: "limited" | "partial" | "complete";
  readonly missingSections: readonly string[];
  readonly disclaimer: string;
}

const mapNodes = (items: readonly CasItem[], kind: CasNodeKind): CasNode[] =>
  items.map((item) => ({ ...item, kind }));

/** Build an explicit CAS maintenance loop from clinician/user supplied facts. */
export function formulateCas(input: CasFormulationInput): CasFormulation {
  const groups = {
    positive: mapNodes(input.positiveMetacognitiveBeliefs, "positive_metacognitive_belief"),
    negative: mapNodes(input.negativeMetacognitiveBeliefs, "negative_metacognitive_belief"),
    worry: mapNodes(input.extendedThinking.worry, "worry"),
    rumination: mapNodes(input.extendedThinking.rumination, "rumination"),
    monitoring: mapNodes(input.threatMonitoring, "threat_monitoring"),
    coping: mapNodes(input.copingResponses, "coping_response"),
    consequences: mapNodes(input.consequences, "consequence"),
    alternatives: mapNodes(input.alternativeResponses ?? [], "alternative_response"),
  };
  const trigger: CasNode = { ...input.trigger, kind: "trigger" };
  const strategies = [...groups.worry, ...groups.rumination, ...groups.monitoring, ...groups.coping];
  const beliefNodes = [...groups.positive, ...groups.negative];
  const edges: CasEdge[] = [];

  for (const belief of beliefNodes) edges.push({ from: trigger.id, to: belief.id, relation: "activates" });
  for (const belief of beliefNodes) {
    for (const strategy of strategies) edges.push({ from: belief.id, to: strategy.id, relation: "activates" });
  }
  for (const strategy of strategies) {
    for (const consequence of groups.consequences) {
      edges.push({ from: strategy.id, to: consequence.id, relation: "maintains" });
    }
  }
  for (const consequence of groups.consequences) {
    for (const belief of groups.negative) {
      edges.push({ from: consequence.id, to: belief.id, relation: "reinforces" });
    }
  }
  for (const alternative of groups.alternatives) {
    for (const strategy of strategies) {
      edges.push({ from: alternative.id, to: strategy.id, relation: "interrupts" });
    }
  }

  const missingSections = [
    ["positiveMetacognitiveBeliefs", groups.positive],
    ["negativeMetacognitiveBeliefs", groups.negative],
    ["CAS strategies", strategies],
    ["consequences", groups.consequences],
  ].filter(([, nodes]) => (nodes as CasNode[]).length === 0).map(([name]) => name as string);

  return {
    schemaVersion: "1.0.0",
    formulationId: input.formulationId,
    nodes: [trigger, ...beliefNodes, ...strategies, ...groups.consequences, ...groups.alternatives],
    edges,
    completeness: missingSections.length === 0
      ? "complete"
      : missingSections.length >= 3
        ? "limited"
        : "partial",
    missingSections,
    disclaimer: "Process formulation for research or education; not a diagnosis or treatment plan.",
  };
}
