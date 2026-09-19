/**
 * Deterministic, explainable rule evaluation.
 *
 * This module evaluates rule-set matches. It intentionally contains no
 * diagnosis API, probabilistic inference, language model, or network access.
 */
import type {
  AssessmentContext,
  Comparator,
  EvaluationResult,
  FactDefinition,
  FactValue,
  RuleNode,
  RulePack,
  RuleTrace,
  TruthState,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

const UNKNOWN_MESSAGE = "Required information is missing or has an incompatible type.";

function compareNumber(actual: number, operator: Comparator, expected: number): boolean {
  switch (operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
  }
}

function trace(
  node: RuleNode,
  state: TruthState,
  message: string,
  factIds: readonly string[] = [],
  children: readonly RuleTrace[] = [],
): RuleTrace {
  return { ruleId: node.id, kind: node.kind, state, message, factIds, children };
}

function evaluateNode(node: RuleNode, facts: AssessmentContext["facts"]): RuleTrace {
  switch (node.kind) {
    case "fact": {
      const actual = facts[node.factId];
      const expected = node.expected ?? true;
      if (actual === undefined || actual === null || typeof actual !== typeof expected) {
        return trace(node, "unknown", UNKNOWN_MESSAGE, [node.factId]);
      }
      const met = actual === expected;
      return trace(
        node,
        met ? "true" : "false",
        met ? "Fact matched the expected value." : "Fact did not match the expected value.",
        [node.factId],
      );
    }
    case "compare": {
      const actual = facts[node.factId];
      if (typeof actual !== "number" || !Number.isFinite(actual)) {
        return trace(node, "unknown", UNKNOWN_MESSAGE, [node.factId]);
      }
      const met = compareNumber(actual, node.operator, node.value);
      return trace(
        node,
        met ? "true" : "false",
        met ? "Numeric comparison passed." : "Numeric comparison failed.",
        [node.factId],
      );
    }
    case "all": {
      const children = node.rules.map((rule) => evaluateNode(rule, facts));
      const state: TruthState = children.some((child) => child.state === "false")
        ? "false"
        : children.some((child) => child.state === "unknown")
          ? "unknown"
          : "true";
      return trace(node, state, "All child rules are required.", [], children);
    }
    case "any": {
      const children = node.rules.map((rule) => evaluateNode(rule, facts));
      const threshold = node.atLeast ?? 1;
      const met = children.filter((child) => child.state === "true").length;
      const unknown = children.filter((child) => child.state === "unknown").length;
      const state: TruthState = met >= threshold
        ? "true"
        : met + unknown < threshold
          ? "false"
          : "unknown";
      return trace(
        node,
        state,
        `${met} child rule(s) matched; ${threshold} required.`,
        [],
        children,
      );
    }
    case "count": {
      const values = node.factIds.map((factId) => facts[factId]);
      const met = values.filter((value) => value === true).length;
      const unknown = values.filter((value) => value === undefined || value === null).length;
      const unknownFactIds = node.factIds.filter((factId) => {
        const value = facts[factId];
        return value === undefined || value === null;
      });
      const minimumPossible = met;
      const maximumPossible = met + unknown;
      const lowerSatisfied = met >= node.atLeast;
      const upperSatisfied = node.atMost === undefined || met <= node.atMost;
      let state: TruthState;
      if (!upperSatisfied || maximumPossible < node.atLeast) {
        state = "false";
      } else if (lowerSatisfied && (node.atMost === undefined || maximumPossible <= node.atMost)) {
        state = "true";
      } else {
        state = "unknown";
      }
      return trace(
        node,
        state,
        `${met} fact(s) matched; possible range ${minimumPossible}-${maximumPossible}.`,
        unknownFactIds,
      );
    }
    case "not": {
      const child = evaluateNode(node.rule, facts);
      const state: TruthState = child.state === "true"
        ? "false"
        : child.state === "false"
          ? "true"
          : "unknown";
      return trace(node, state, "Child rule is negated.", [], [child]);
    }
  }
}

function collectMissing(traceNode: RuleTrace, target = new Set<string>()): Set<string> {
  if (traceNode.state === "unknown") {
    for (const factId of traceNode.factIds) target.add(factId);
  }
  for (const child of traceNode.children) collectMissing(child, target);
  return target;
}

/** Evaluate a validated rule pack without mutating the pack or assessment. */
export function evaluateRulePack(pack: RulePack, context: AssessmentContext): EvaluationResult {
  const validation = validateRulePack(pack);
  if (!validation.valid) {
    throw new Error(`Invalid rule pack: ${validation.issues.map((issue) => issue.message).join("; ")}`);
  }

  const inclusion = evaluateNode(pack.inclusion, context.facts);
  const exclusion = pack.exclusion === undefined
    ? undefined
    : evaluateNode(pack.exclusion, context.facts);

  const disposition = inclusion.state === "false"
    ? "criteria_not_met"
    : inclusion.state === "unknown"
      ? "insufficient_information"
      : exclusion?.state === "true"
        ? "excluded"
        : exclusion?.state === "unknown"
          ? "insufficient_information"
          : "criteria_met";

  const missing = collectMissing(inclusion);
  if (exclusion !== undefined) collectMissing(exclusion, missing);

  return {
    schemaVersion: "1.0.0",
    engine: "psych-rulekit",
    rulePackId: pack.id,
    rulePackVersion: pack.version,
    disposition,
    inclusion,
    ...(exclusion === undefined ? {} : { exclusion }),
    missingFactIds: [...missing].sort(),
    warnings: [
      "Research-use rule-set match; not a diagnosis or treatment recommendation.",
      `Rule-pack review status: ${pack.review.status}.`,
    ],
  };
}

function collectRuleIssues(
  node: RuleNode,
  factMap: ReadonlyMap<string, FactDefinition>,
  seenRuleIds: Set<string>,
  path: string,
  issues: ValidationIssue[],
): void {
  if (seenRuleIds.has(node.id)) {
    issues.push({ path, code: "duplicate_id", message: `Duplicate rule id: ${node.id}` });
  }
  seenRuleIds.add(node.id);

  const requireFact = (factId: string, expectedType?: FactDefinition["valueType"]): void => {
    const definition = factMap.get(factId);
    if (definition === undefined) {
      issues.push({ path, code: "missing_reference", message: `Unknown fact reference: ${factId}` });
    } else if (expectedType !== undefined && definition.valueType !== expectedType) {
      issues.push({
        path,
        code: "type_mismatch",
        message: `Fact ${factId} must have valueType ${expectedType}.`,
      });
    }
  };

  switch (node.kind) {
    case "fact":
      requireFact(node.factId, typeof (node.expected ?? true) === "boolean" ? "boolean" : "string");
      break;
    case "compare":
      requireFact(node.factId, "number");
      break;
    case "count": {
      if (node.factIds.length === 0) {
        issues.push({ path, code: "empty_collection", message: "Count rule requires at least one fact." });
      }
      if (node.atLeast < 0 || node.atLeast > node.factIds.length) {
        issues.push({ path, code: "invalid_threshold", message: `Invalid count threshold in ${node.id}.` });
      }
      if (node.atMost !== undefined && (node.atMost < node.atLeast || node.atMost > node.factIds.length)) {
        issues.push({ path, code: "invalid_threshold", message: `Invalid atMost threshold in ${node.id}.` });
      }
      for (const factId of node.factIds) requireFact(factId, "boolean");
      break;
    }
    case "all":
    case "any": {
      if (node.rules.length === 0) {
        issues.push({ path, code: "empty_collection", message: `${node.kind} rule requires child rules.` });
      }
      if (node.kind === "any" && node.atLeast !== undefined &&
          (node.atLeast < 1 || node.atLeast > node.rules.length)) {
        issues.push({ path, code: "invalid_threshold", message: `Invalid any threshold in ${node.id}.` });
      }
      node.rules.forEach((child, index) =>
        collectRuleIssues(child, factMap, seenRuleIds, `${path}.rules[${index}]`, issues));
      break;
    }
    case "not":
      collectRuleIssues(node.rule, factMap, seenRuleIds, `${path}.rule`, issues);
      break;
  }
}

/** Structural validation; clinical validity remains a separate review obligation. */
export function validateRulePack(pack: RulePack): ValidationResult {
  const issues: ValidationIssue[] = [];
  const factMap = new Map<string, FactDefinition>();
  for (const [index, fact] of pack.facts.entries()) {
    if (factMap.has(fact.id)) {
      issues.push({
        path: `facts[${index}].id`,
        code: "duplicate_id",
        message: `Duplicate fact id: ${fact.id}`,
      });
    }
    factMap.set(fact.id, fact);
  }
  if (pack.evidence.length === 0) {
    issues.push({
      path: "evidence",
      code: "missing_provenance",
      message: "At least one provenance reference is required.",
    });
  }
  const seenRuleIds = new Set<string>();
  collectRuleIssues(pack.inclusion, factMap, seenRuleIds, "inclusion", issues);
  if (pack.exclusion !== undefined) {
    collectRuleIssues(pack.exclusion, factMap, seenRuleIds, "exclusion", issues);
  }
  return { valid: issues.length === 0, issues };
}

/** Public helper for UI previews and tests of individual rule nodes. */
export function evaluateRule(node: RuleNode, facts: Readonly<Record<string, FactValue | undefined>>): RuleTrace {
  return evaluateNode(node, facts);
}
