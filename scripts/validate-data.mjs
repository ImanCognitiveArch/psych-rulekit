/** Validate the shipped JSON files and guard the public package boundary. */
import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const cas = await readJson("../data/cas-process-v1.json");
const registry = await readJson("../data/research-registry.json");
const schema = await readJson("../schema/rule-pack.schema.json");
const template = await readJson("../templates/rule-pack.template.json");

if (cas.schemaVersion !== "1.0.0") throw new Error("Unexpected CAS schema version");
if (!Array.isArray(registry.entries) || registry.entries.length !== 40) {
  throw new Error("Research registry must contain exactly 40 draft-scope entries");
}
if (registry.entries.some((entry) => entry.rules !== undefined)) {
  throw new Error("Public registry must not embed unreviewed diagnostic rules");
}
if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
  throw new Error("Unexpected JSON Schema dialect");
}

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
const validateRulePack = ajv.compile(schema);
if (!validateRulePack(template)) {
  throw new Error(`Rule-pack template failed schema validation: ${ajv.errorsText(validateRulePack.errors)}`);
}

console.log("Validated CAS model, 40-entry registry, compiled schema, and rule-pack template.");
