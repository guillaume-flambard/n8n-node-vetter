# n8n verified community node — vetting rules

The canonical ruleset behind `n8n-node-vetter`. Each rule is a small, testable check
against a community-node package. Sources are the official n8n docs (fetched from the
`n8n-io/n8n-docs` clone, 2026-07) plus patterns learned shipping `n8n-nodes-opn`.

Two layers:

- **Deterministic** rules run in the CLI. A machine can decide pass/fail with no judgment.
- **Judgment** rules need a human or an LLM reviewer. The CLI flags where to look; it does
  not rule on them. They live in the review agent and the `/n8n-vetting` skill.

Severity: **fail** blocks verification, **warn** should be fixed or manually confirmed,
**info** is a note. Status per run: `pass` / `fail` / `warn` / `skip` (rule not applicable).

## Sources

- Submit community nodes — Standards + Publishing to npm:
  https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes
- Install verified community nodes:
  https://docs.n8n.io/integrations/community-nodes/installation-and-management/install-verified-community-nodes
- Blocklist (low quality / malicious removal):
  https://docs.n8n.io/integrations/community-nodes/blocklist
- Verification guidelines + UX guidelines: n8n Creator docs
  (`create-nodes/build-your-node/reference/verification-guidelines`, `…/ux-guidelines`)
- Author experience: shipping the `n8n-nodes-opn` community node (public on npm/GitHub).

---

## Deterministic rules (CLI)

### PKG_NAME — package name namespace
- **Severity:** fail
- **Check:** `name` matches `^(@[^/]+\/)?n8n-nodes-.+`
- **Why:** the registry only lists packages named `n8n-nodes-*` or `@scope/n8n-nodes-*`.
- **Fix:** rename the package (e.g. `n8n-nodes-weather` or `@acme/n8n-nodes-weather`).

### KEYWORD — community-node keyword
- **Severity:** fail
- **Check:** `keywords` includes `n8n-community-node-package`.
- **Why:** required keyword; its absence hides the package from the registry crawler.
- **Fix:** add `"n8n-community-node-package"` to `keywords`.

### N8N_ATTR — n8n manifest present
- **Severity:** fail
- **Check:** `package.json` has an `n8n` object with a non-empty `nodes` array.
- **Why:** n8n loads nodes and credentials from this attribute; missing = nothing registers.
- **Fix:** add `"n8n": { "n8nNodesApiVersion": 1, "nodes": ["dist/..."], "credentials": [...] }`.

### N8N_DIST — manifest points at compiled output
- **Severity:** fail
- **Check:** every path in `n8n.nodes` and `n8n.credentials` points under `dist/`
  (compiled `.js`), never at TypeScript source (`nodes/…​.ts`, `src/…`).
- **Why:** the published package must reference built JS. Pointing at source is the #1
  reason a node loads in dev but breaks once installed from npm.
- **Fix:** point every entry at `dist/...js` and ensure `build` runs before publish.

### NO_RUNTIME_DEPS — zero runtime dependencies
- **Severity:** fail
- **Check:** `dependencies` is absent or empty. `devDependencies` and `peerDependencies`
  are allowed.
- **Why:** *"verified community nodes aren't allowed to use any run-time dependencies"*
  (official standards). The single most selective criterion. Do all HTTP through n8n's
  own request helpers / declarative routing instead of an SDK.
- **Fix:** remove runtime deps; replace SDK calls with `this.helpers.httpRequest` or a
  declarative `routing` block.

### FILES_DIST — tarball ships dist
- **Severity:** warn
- **Check:** `files` includes `dist` (or `dist/`), so `npm publish` ships compiled output.
- **Why:** if `files` omits `dist`, the published tarball can miss the very code `n8n`
  points at. A green local build hides this until someone installs from npm.
- **Fix:** set `"files": ["dist"]`.

### README — documentation present
- **Severity:** warn
- **Check:** a non-trivial `README.md` exists (> 200 chars).
- **Why:** verification requires *"appropriate documentation in the form of a README"*.
- **Fix:** document what the node does, credentials setup, and each operation.

### ESLINT_PLUGIN — community linter wired
- **Severity:** warn
- **Check:** `eslint-plugin-n8n-nodes-base` is a devDependency, and an ESLint config
  extends its `community` / `nodes` / `credentials` rulesets.
- **Why:** the official flow lints with this plugin (`npm run lint`). Its absence means the
  node was never checked against n8n's own conventions.
- **Fix:** add the plugin and extend `plugin:n8n-nodes-base/community` (+ `nodes`,
  `credentials`) in `.eslintrc`. Or scaffold with the `n8n-node` CLI, which wires it.

### PROVENANCE — published via GitHub Actions with provenance
- **Severity:** warn (cannot be proven offline; flags the gap)
- **Check:** a workflow under `.github/workflows/` runs `npm publish` with `--provenance`
  **or** declares `permissions: id-token: write`, **or** the repo uses the
  `n8n-nodes-starter` `publish.yml` / `@n8n/node-cli` release flow.
- **Why:** *"From May 1st 2026, nodes submitted for verification must be published using
  GitHub Actions with a provenance statement. n8n won't accept verified nodes published
  directly from a local machine."* Definitive proof is the attestation on the npm registry;
  the CLI can only confirm the publishing path exists in the repo.
- **Fix:** add the starter `publish.yml` (or an OIDC `release.yml` with `id-token: write`
  and `npm publish --provenance`), and configure a Trusted Publisher on npmjs.com.

### NO_FS_ENV — no filesystem or environment access
- **Severity:** warn (static scan can false-positive; confirm each hit)
- **Check:** source/compiled files do not reference `require('fs')` / `from 'fs'`,
  `child_process`, or `process.env`.
- **Why:** verified nodes run constrained; reading the filesystem or host env variables is
  outside a node's remit and a common rejection cause. A node's config belongs in
  credentials and parameters, not `process.env`.
- **Fix:** remove `fs`/`child_process`/`process.env`; take inputs via node parameters and
  credentials.

### DECLARATIVE — declarative vs programmatic style
- **Severity:** info
- **Check:** report whether node files use a `routing` block (declarative) or an
  `execute()` method (programmatic).
- **Why:** not a pass/fail. Declarative nodes are simpler to vet and n8n prefers them for
  straightforward REST integrations; programmatic is legitimate when logic demands it. The
  note tells a reviewer which lens to apply.
- **Fix:** none. Informational.

---

## Judgment rules (review agent / skill — not the CLI)

These need reading the code with intent. The CLI cannot rule on them; the reviewer must.

### VERIFY_WEBHOOK — unsigned webhooks must be verified
- If the node is a trigger consuming a provider webhook, check whether payloads are signed.
  When they are not, the node must re-fetch the resource from the provider using its own
  credential before emitting (verify-by-refetch), and drop on failure. Emitting an
  unverified body lets anyone who finds the URL inject fabricated events.
- Reference implementation: `nodes-opn` `OpnTrigger`, `Verify Event` default-on.

### CRED_LEAK — no credential leakage in output
- Secrets from credentials must never land in node output items, logs, or error messages.
  Check that error branches don't echo the request auth header or the raw credential.

### CONTENT_TYPE — request encoding tested against the live API
- Declarative nodes default to `application/json`. Many payment/legacy APIs (Stripe/Omise
  style) expect `application/x-www-form-urlencoded`. A node that "declares" correctly but was
  never run against the real API can 4xx at runtime. Confirm a real call was made.
- Seen in practice shipping the `n8n-nodes-opn` node.

### LIST_ENVELOPE — getAll returns items, not the envelope
- A list/`getAll` operation that returns `{ object: 'list', data: [...] }` as a single item
  was not tested on real data. It needs `postReceive.rootProperty: 'data'` to split into
  per-item output. This is *tell #1* that a node shipped without a real API run.
- Seen in practice shipping the `n8n-nodes-opn` node.

### PAID_FEATURE_OVERLAP — does not compete with n8n paid features
- *"n8n reserves the right to reject nodes that compete with any of n8n's paid features,
  especially enterprise functionality."* A judgment call on scope, not code.

---

## The automation angle (what wins the debrief)

For every recurring finding, the Community Engineering answer is not "flag it each time" but
"catch this class at the source." The deterministic rules above are that automation: they
turn a manual reviewer checklist into a check any contributor can run before submitting,
and the squad can run in CI on every Creator Portal submission. Framing a review this way —
*fix the friction at the source* — is the phrase from the job description that lands.
