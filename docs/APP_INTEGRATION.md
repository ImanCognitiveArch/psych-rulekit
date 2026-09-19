# React Native / Expo integration

PsychRuleKit is designed to run locally and deterministically. The core performs
no network calls and does not require an account, analytics service, or backend.

## Install

From npm after the first release:

```bash
npm install psych-rulekit
```

Before npm publication, install from a GitHub release or repository tag:

```bash
npm install github:ImanCognitiveArch/psych-rulekit#v0.1.0
```

## Evaluate and adapt

```ts
import {
  evaluateRulePack,
  toAppEvaluationRecord,
  type AssessmentContext,
  type RulePack,
} from "psych-rulekit";

export function runResearchRules(
  rulePack: RulePack,
  facts: AssessmentContext["facts"],
) {
  const evaluation = evaluateRulePack(rulePack, {
    observedAt: new Date().toISOString(),
    facts,
  });

  return toAppEvaluationRecord(evaluation);
}
```

Do not map unanswered questions to `false`. Use `null` or omit the fact so the
engine can return `insufficient_information`.

## SQLite migration

```ts
import { APP_EVALUATION_TABLE_SQL } from "psych-rulekit/app";

await database.execAsync(APP_EVALUATION_TABLE_SQL);
```

Persist the adapted record rather than the complete trace unless the research
protocol explicitly requires the trace. Do not persist raw free text or personal
identifiers by default.

```ts
await database.runAsync(
  `INSERT INTO psych_rule_evaluations (
     evaluation_id, created_at, rule_pack_id, rule_pack_version,
     disposition, missing_fact_ids_json, schema_version, is_demo
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  record.evaluationId,
  record.createdAt,
  record.rulePack.id,
  record.rulePack.version,
  record.result.disposition,
  JSON.stringify(record.result.missingFactIds),
  record.schemaVersion,
  record.isDemo ? 1 : 0,
);
```

## UI wording

Use the label supplied by the adapter. Keep the following statement visible:

> Research-use rule match only. This output is not a clinical diagnosis.

Avoid “You have…”, “diagnosed”, “confirmed”, “ruled out”, and treatment
recommendations based only on the engine result.

## Boundary for ResilioSleep-like apps

If the host app is a privacy-first, non-clinical sleep/resilience companion,
do not merge this feature into sleep-state estimation. Keep a separate optional
research module, separate tables, explicit consent, separate deletion controls,
and the app's existing “not clinical sleep stages / not diagnosis” language.
