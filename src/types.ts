/**
 * Public data contracts for PsychRuleKit.
 *
 * The central safety contract is three-valued logic: missing information is
 * `unknown`, never silently treated as absent.
 */

export type TruthState = "true" | "false" | "unknown";
export type FactValue = boolean | number | string | null;
export type EvaluationDisposition =
  | "criteria_met"
  | "criteria_not_met"
  | "insufficient_information"
  | "excluded";

export interface EvidenceReference {
  readonly id: string;
  readonly citation: string;
  readonly locator?: string;
  readonly url?: string;
  readonly license?: string;
  readonly permissionStatus:
    | "open"
    | "permission_granted"
    | "citation_only"
    | "unknown";
}

export interface ReviewRecord {
  readonly status: "draft" | "method_reviewed" | "clinically_reviewed" | "validated";
  readonly reviewerRole?: string;
  readonly reviewedAt?: string;
  readonly notes?: string;
}

export interface FactDefinition {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly valueType: "boolean" | "number" | "string";
  readonly unit?: "count" | "day" | "week" | "month" | "year" | "percent";
  readonly sensitive?: boolean;
}

export type Comparator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

export type RuleNode =
  | {
      readonly kind: "fact";
      readonly id: string;
      readonly factId: string;
      readonly expected?: boolean | string;
      readonly rationale?: string;
    }
  | {
      readonly kind: "compare";
      readonly id: string;
      readonly factId: string;
      readonly operator: Comparator;
      readonly value: number;
      readonly rationale?: string;
    }
  | {
      readonly kind: "all";
      readonly id: string;
      readonly rules: readonly RuleNode[];
      readonly rationale?: string;
    }
  | {
      readonly kind: "any";
      readonly id: string;
      readonly rules: readonly RuleNode[];
      readonly atLeast?: number;
      readonly rationale?: string;
    }
  | {
      readonly kind: "count";
      readonly id: string;
      readonly factIds: readonly string[];
      readonly atLeast: number;
      readonly atMost?: number;
      readonly rationale?: string;
    }
  | {
      readonly kind: "not";
      readonly id: string;
      readonly rule: RuleNode;
      readonly rationale?: string;
    };

export interface RulePack {
  readonly schemaVersion: "1.0.0";
  readonly id: string;
  readonly title: string;
  readonly version: string;
  readonly description: string;
  readonly intendedUse: "education" | "research" | "screening_research";
  readonly locale: string;
  readonly jurisdiction?: string;
  readonly facts: readonly FactDefinition[];
  readonly inclusion: RuleNode;
  readonly exclusion?: RuleNode;
  readonly evidence: readonly EvidenceReference[];
  readonly review: ReviewRecord;
  readonly license: string;
}

export interface AssessmentContext {
  readonly assessmentId?: string;
  readonly observedAt?: string;
  readonly facts: Readonly<Record<string, FactValue | undefined>>;
}

export interface RuleTrace {
  readonly ruleId: string;
  readonly kind: RuleNode["kind"];
  readonly state: TruthState;
  readonly message: string;
  readonly factIds: readonly string[];
  readonly children: readonly RuleTrace[];
}

export interface EvaluationResult {
  readonly schemaVersion: "1.0.0";
  readonly engine: "psych-rulekit";
  readonly rulePackId: string;
  readonly rulePackVersion: string;
  readonly disposition: EvaluationDisposition;
  readonly inclusion: RuleTrace;
  readonly exclusion?: RuleTrace;
  readonly missingFactIds: readonly string[];
  readonly warnings: readonly string[];
}

export interface ValidationIssue {
  readonly path: string;
  readonly code:
    | "duplicate_id"
    | "empty_collection"
    | "invalid_threshold"
    | "missing_reference"
    | "missing_provenance"
    | "type_mismatch";
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}
