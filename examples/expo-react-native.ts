/** Generic React Native/Expo integration example. */
import {
  APP_EVALUATION_TABLE_SQL,
  evaluateRulePack,
  toAppEvaluationRecord,
  type AssessmentContext,
} from "psych-rulekit";
import { syntheticStressLoopPack } from "./synthetic-stress-loop.js";

const assessment: AssessmentContext = {
  assessmentId: "local-demo",
  observedAt: new Date().toISOString(),
  facts: {
    trigger_present: true,
    worry_present: true,
    rumination_present: false,
    threat_monitoring_present: true,
    coping_control_present: null,
    impact_present: true,
    duration_days: 10,
    outside_scope: false,
  },
};

const evaluation = evaluateRulePack(syntheticStressLoopPack, assessment);
export const appRecord = toAppEvaluationRecord(evaluation);
export const sqliteMigration = APP_EVALUATION_TABLE_SQL;
