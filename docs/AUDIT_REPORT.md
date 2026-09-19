# Audit of the initial 40-condition draft

Date: 2026-09-19  
Scope: engineering, publication safety, and data-model fitness. This is not an
independent clinical validation of any diagnostic manual.

## Decision

The draft is valuable as a requirements map, but it is not safe to execute or
publish as a DSM-5 diagnostic database. The original rule objects are therefore
quarantined from the public package. The 40 labels remain in a non-executable
research registry so the roadmap is preserved.

## Blocking findings

| Finding | Example in the draft | Engineering consequence |
| --- | --- | --- |
| Requirements mixed with exclusions | ADHD age-of-onset and multi-setting requirements, and adult-age/history requirements for antisocial personality disorder, appear under `exclusion_criteria`. | The engine would reject cases when a required condition is present. |
| Harm/significance rule inverted | The OCD time/impairment condition appears as an exclusion. | A positive significance condition could incorrectly block a match. |
| `ANY` vs `ALL` is ambiguous | Core arrays do not say whether one, all, or a threshold is required. | Clinically different logical structures collapse into one list. |
| One global count is insufficient | PTSD, autism, and other multi-cluster structures require per-cluster logic. | Total counts can pass while a required cluster fails. |
| Time represented as fractional weeks | Values such as `0.1` and `0.4` weeks approximate day ranges. | Boundary behavior is obscure and cannot represent minimum plus maximum duration. |
| Duration invented or flattened | Personality patterns were represented as `52` weeks; schizophrenia-like entries flatten distinct time requirements. | Longitudinal and developmental meaning is lost. |
| Conditional thresholds are absent | Some activation/mood rules require different counts depending on accompanying features. | A single `min_symptoms_required` can produce false matches. |
| Code provenance is absent | One `icd_10_code` string is attached without edition, country modification, or effective date. | Codes cannot be safely updated or interpreted across jurisdictions. |
| Edition and update state are absent | The draft mixes “DSM-5” naming with potentially later terminology/codes. | Researchers cannot reproduce which source version was implemented. |
| Missing data becomes negative data | The sample engine used `includes()` and booleans. | Unasked questions silently behave as absent symptoms/exclusions. |
| Copyright/permission metadata is absent | Criteria-like text is embedded without rights status. | Public redistribution creates avoidable rights risk. |
| Clinical validation is absent | No dual extraction, adjudication, fixtures, or inter-rater review is documented. | “100% accurate” is not supportable, even if code execution is deterministic. |

## What replaced it

- three-valued logic (`true`, `false`, `unknown`);
- recursive `all`, `any`, `count`, comparison, fact, and negation rules;
- separate inclusion and exclusion trees;
- exact, typed units instead of fractional-week shortcuts;
- provenance, rights status, locale, jurisdiction, version, and review metadata;
- explainable traces and missing-fact lists;
- non-diagnostic app output;
- a rule-pack admission gate requiring independent review.

## Safe migration path for each condition

1. Select the authoritative edition and jurisdiction.
2. Confirm permission to encode and redistribute the intended content.
3. Extract rules independently by two qualified reviewers.
4. Adjudicate discrepancies and record locators for every rule.
5. Encode nested logic and exact temporal bounds.
6. Create positive, negative, boundary, exclusion, and missing-data fixtures.
7. Complete clinical/methodological review.
8. Release the rule pack separately with its own version and license.

Until all eight steps are complete, the registry status should remain
`quarantined_unverified_draft`.
