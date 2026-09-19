# Contributing

Contributions are welcome for the engine, documentation, tests, and properly
governed rule packs.

## Pull-request requirements

- Describe the research use case and any safety impact.
- Add tests for positive, negative, boundary, and unknown paths.
- Keep engine behavior deterministic and offline-capable.
- Run `npm run verify`.
- Do not include personal assessment data.

## Rule-pack requirements

Open a rule-pack proposal issue before writing a pack. Include authoritative
source locators, permission status, edition, locale/jurisdiction, intended use,
reviewers, and validation plan. Criteria copied or closely adapted from a
protected manual will not be accepted without documented redistribution rights.

## Review standard

Structural review proves that the code represents the submitted logic. It does
not prove that the logic is clinically valid. Clinical and methodological
reviews must be documented separately.
