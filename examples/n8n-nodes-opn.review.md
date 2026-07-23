# Vetting review: n8n-nodes-opn

**Verdict:** PASS — meets the deterministic verified-node standards.

**Summary:** 0 fail · 0 warn · 10 pass · 1 info · 0 skip

## [PASS] PKG_NAME — Package name uses the n8n-nodes- namespace
- Severity: fail
- Evidence: name "n8n-nodes-opn" matches ^(@scope/)?n8n-nodes-.

## [PASS] KEYWORD — Declares the n8n-community-node-package keyword
- Severity: fail
- Evidence: keywords include "n8n-community-node-package".

## [PASS] N8N_ATTR — Declares nodes in the package.json n8n attribute
- Severity: fail
- Evidence: n8n.nodes lists 2 node(s), 1 credential(s).

## [PASS] N8N_DIST — n8n manifest points at compiled dist output
- Severity: fail
- Evidence: all 3 manifest path(s) resolve under dist/.

## [PASS] NO_RUNTIME_DEPS — No runtime dependencies
- Severity: fail
- Evidence: dependencies is empty or absent.

## [PASS] FILES_DIST — Published tarball ships the dist directory
- Severity: warn
- Evidence: files field includes "dist".

## [PASS] README — Ships user-facing documentation (README)
- Severity: warn
- Evidence: README.md present (3737 chars).

## [PASS] ESLINT_PLUGIN — ESLint n8n community ruleset is wired up
- Severity: warn
- Evidence: eslint-plugin-n8n-nodes-base is a devDependency.

## [PASS] PROVENANCE — Publishes via GitHub Actions with provenance
- Severity: warn
- Evidence: workflow shows: npm publish --provenance; id-token: write permission. Confirm the attestation appears on the npm package page.

## [PASS] NO_FS_ENV — No filesystem or environment access in node code
- Severity: warn
- Evidence: scanned 13 file(s); no fs/child_process/process.env.

## [PASS] DECLARATIVE — Node implementation style
- Severity: info
- Evidence: Declarative (routing blocks, no execute()). Simplest to vet.


---

_Deterministic checks only. Judgment rules (webhook verification, credential leakage, request encoding, list envelopes, paid-feature overlap) still need a human or AI review — see the /n8n-vetting playbook._

