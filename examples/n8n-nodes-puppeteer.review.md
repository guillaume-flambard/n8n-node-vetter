# Vetting review: n8n-nodes-puppeteer

**Verdict:** BLOCKED — one or more hard requirements fail. Verification would be rejected.

**Summary:** 1 fail · 2 warn · 7 pass · 1 info · 0 skip

## [FAIL] NO_RUNTIME_DEPS — No runtime dependencies
- Severity: fail
- Evidence: declares 6 runtime dependency(ies): @n8n/vm2, puppeteer, puppeteer-extra, puppeteer-extra-plugin-human-typing, puppeteer-extra-plugin-stealth, puppeteer-extra-plugin-user-preferences.
- Fix: Remove runtime deps. Do HTTP via this.helpers.httpRequest or a declarative routing block; move build-only packages to devDependencies.

## [WARN] PROVENANCE — Publishes via GitHub Actions with provenance
- Severity: warn
- Evidence: no .github/workflows/*.yml found.
- Fix: Add the n8n-nodes-starter publish.yml (or an OIDC release.yml with id-token: write and npm publish --provenance) and set a Trusted Publisher on npmjs.com.

## [WARN] NO_FS_ENV — No filesystem or environment access in node code
- Severity: warn
- Evidence: 13 reference(s) to fs/child_process/process.env:
    dist/nodes/Puppeteer/Puppeteer.node.js:10 const fs_1 = require("fs");
    dist/nodes/Puppeteer/Puppeteer.node.js:18 const { NODE_FUNCTION_ALLOW_BUILTIN: builtIn, NODE_FUNCTION_ALLOW_EXTERNAL: external, CODE_ENABLE_STDOUT, } = process.env;
    dist/nodes/Puppeteer/Puppeteer.node.js:342 process.env.PUPPETEER_BROWSER_WS_ENDPOINT ||
    dist/nodes/Puppeteer/Puppeteer.node.js:343 process.env.PUPPETEER_WS_ENDPOINT ||
    dist/nodes/Puppeteer/Puppeteer.node.js:346 process.env.PUPPETEER_PROTOCOL;
- Fix: Remove filesystem/child_process/env access; take inputs via node parameters and credentials. Confirm each hit — a static scan can flag comments or strings.

## [PASS] PKG_NAME — Package name uses the n8n-nodes- namespace
- Severity: fail
- Evidence: name "n8n-nodes-puppeteer" matches ^(@scope/)?n8n-nodes-.

## [PASS] KEYWORD — Declares the n8n-community-node-package keyword
- Severity: fail
- Evidence: keywords include "n8n-community-node-package".

## [PASS] N8N_ATTR — Declares nodes in the package.json n8n attribute
- Severity: fail
- Evidence: n8n.nodes lists 1 node(s), 0 credential(s).

## [PASS] N8N_DIST — n8n manifest points at compiled dist output
- Severity: fail
- Evidence: all 1 manifest path(s) resolve under dist/.

## [PASS] FILES_DIST — Published tarball ships the dist directory
- Severity: warn
- Evidence: files field includes "dist".

## [PASS] README — Ships user-facing documentation (README)
- Severity: warn
- Evidence: README.md present (19824 chars).

## [PASS] ESLINT_PLUGIN — ESLint n8n community ruleset is wired up
- Severity: warn
- Evidence: eslint-plugin-n8n-nodes-base is a devDependency.

## [PASS] DECLARATIVE — Node implementation style
- Severity: info
- Evidence: Programmatic (execute() method). Legitimate when logic demands it; review the HTTP calls by hand.


---

_Deterministic checks only. Judgment rules (webhook verification, credential leakage, request encoding, list envelopes, paid-feature overlap) still need a human or AI review — see the /n8n-vetting playbook._

