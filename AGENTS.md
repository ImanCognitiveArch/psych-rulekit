# Repository rules

- Preserve the boundary between the open engine and separately governed rule packs.
- Never add copyrighted diagnostic criteria without documented permission.
- Never label an engine result as a diagnosis or treatment recommendation.
- Unknown information must remain unknown; never coerce it to `false`.
- Keep evaluation deterministic, explainable, offline-capable, and free of network calls.
- Every rule pack must include version, provenance, review status, and intended purpose.
- New rule operators require unit tests for true, false, and unknown paths.
- App adapters must avoid personal identifiers and raw free-text clinical narratives.
- Breaking schema changes require a major version bump and migration notes.
