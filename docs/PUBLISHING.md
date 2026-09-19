# Publishing runbook

## Recommended distribution

Use all three layers:

1. **GitHub** is the canonical collaboration repository.
2. **npm** is the installable TypeScript/React Native artifact.
3. **Zenodo** archives GitHub releases and supplies a DOI for academic citation.

GitHub alone is excellent for collaboration but weaker for package installation
and scholarly citation. The three-layer model serves developers and researchers
without duplicating the source of truth.

## 1. Prepare identity

The canonical repository identity is
`https://github.com/ImanCognitiveArch/psych-rulekit`. The author identity is
`Iman Khorami`. If the unscoped npm name is unavailable at publication time,
use a scope owned by the maintainer's npm account and update package metadata
before publishing.

Do not put DSM or DSM-5 in the repository/package name. The README may discuss
compatibility boundaries, but the project must not imply an official or licensed
DSM implementation.

## 2. Verify locally

```bash
npm ci
npm run verify
```

Review the exact npm payload:

```bash
npm pack --dry-run
```

Confirm no private data, source manual scans, credentials, raw assessments, or
unreviewed criteria are present.

## 3. Create GitHub repository

Create an empty **public** repository named `psych-rulekit`. Do not initialize
it with a README, license, or `.gitignore`, because those files already exist.

```bash
git init
git branch -M main
git add .
git commit -m "feat: publish PsychRuleKit v0.1.0 research engine"
git remote add origin https://github.com/ImanCognitiveArch/psych-rulekit.git
git push -u origin main
```

Then enable:

- branch protection requiring the `verify` check;
- Issues and Discussions;
- Dependabot security updates;
- private vulnerability reporting;
- the repository citation panel (detected from `CITATION.cff`).

## 4. Create the first release

```bash
git tag -a v0.1.0 -m "PsychRuleKit v0.1.0"
git push origin v0.1.0
```

On GitHub, draft a release from `v0.1.0`. State clearly that the 40-condition
registry is non-executable and that no diagnostic criteria are distributed.

## 5. Publish to npm

Create an npm account, enable two-factor authentication, and verify that the
package contents are correct.

```bash
npm login
npm publish --access public
```

For subsequent releases, update the version, changelog, tag, and GitHub release.
Prefer npm trusted publishing/provenance once the GitHub repository is connected.

## 6. Archive with Zenodo

Connect the GitHub account in Zenodo, enable this repository, and publish a new
GitHub release. Zenodo will archive the release. Add the resulting version DOI
to the GitHub release and README; use the concept DOI when citing the software
across versions.

## 7. Rule-pack release policy

Release rule packs independently from the engine. A pack that lacks confirmed
redistribution rights stays private, even if its source code representation is
technically complete. A disclaimer does not replace permission or validation.
