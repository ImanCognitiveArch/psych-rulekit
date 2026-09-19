/**
 * Stable, privacy-minimizing output contract for React Native/Expo apps.
 *
 * The adapter stores the evaluation summary and missing fact identifiers, not
 * raw narrative responses or personally identifying information.
 */
import type { EvaluationDisposition, EvaluationResult } from "./types.js";

export interface AppEvaluationRecord {
  readonly schemaVersion: "1.0.0";
  readonly recordType: "research_rule_evaluation";
  readonly evaluationId: string;
  readonly createdAt: string;
  readonly isDemo: boolean;
  readonly rulePack: {
    readonly id: string;
    readonly version: string;
  };
  readonly result: {
    readonly disposition: EvaluationDisposition;
    readonly label: string;
    readonly missingFactIds: readonly string[];
  };
  readonly safety: {
    readonly isDiagnosis: false;
    readonly requiresHumanInterpretation: true;
    readonly disclaimer: string;
  };
}

const LABELS: Readonly<Record<EvaluationDisposition, string>> = {
  criteria_met: "Supplied facts match this research rule set",
  criteria_not_met: "Supplied facts do not match this research rule set",
  insufficient_information: "More information is required",
  excluded: "An exclusion rule was matched",
};

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function toAppEvaluationRecord(
  evaluation: EvaluationResult,
  createdAt = new Date().toISOString(),
  isDemo = false,
): AppEvaluationRecord {
  const identity = [
    evaluation.rulePackId,
    evaluation.rulePackVersion,
    evaluation.disposition,
    evaluation.missingFactIds.join(","),
    createdAt,
    String(isDemo),
  ].join("|");

  return {
    schemaVersion: "1.0.0",
    recordType: "research_rule_evaluation",
    evaluationId: `pre_${stableHash(identity)}`,
    createdAt,
    isDemo,
    rulePack: { id: evaluation.rulePackId, version: evaluation.rulePackVersion },
    result: {
      disposition: evaluation.disposition,
      label: LABELS[evaluation.disposition],
      missingFactIds: evaluation.missingFactIds,
    },
    safety: {
      isDiagnosis: false,
      requiresHumanInterpretation: true,
      disclaimer: "Research-use rule match only. This output is not a clinical diagnosis.",
    },
  };
}

/** SQLite DDL suitable for expo-sqlite migrations. */
export const APP_EVALUATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS psych_rule_evaluations (
  evaluation_id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  rule_pack_id TEXT NOT NULL,
  rule_pack_version TEXT NOT NULL,
  disposition TEXT NOT NULL CHECK (
    disposition IN ('criteria_met', 'criteria_not_met', 'insufficient_information', 'excluded')
  ),
  missing_fact_ids_json TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1))
);`.trim();
