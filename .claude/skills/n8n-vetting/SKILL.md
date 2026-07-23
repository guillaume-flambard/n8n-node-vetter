---
name: n8n-vetting
description: Review an n8n community node submission end to end against the verified-node standards. Runs the deterministic checks via the n8n-node-vetter CLI, adds the qualitative judgment pass, and writes a six-section submission review that proposes catching the issue class at the source. Use when reviewing, vetting, or triaging a community node package.
trigger: /n8n-vetting
---

# /n8n-vetting

Review an n8n community node the way a reviewer assesses a Creator Portal submission:
mechanical checks first, judgment second, and a written review that does not just flag
problems but proposes fixing the class of problem at the source.

This skill ships inside the `n8n-node-vetter` repo, so its paths are repo-relative. Run
Claude Code from the repo root and the CLI, docs, and references resolve without setup.

## Usage

```
/n8n-vetting <path-to-package-or-repo>
/n8n-vetting <npm-package-name>   # confirm the download first, then npm pack it
```

## What this is for

- A contributor checking their own node before submitting.
- A reviewer assessing someone else's submission.
- Rehearsing the node-review task itself.

It complements n8n-mcp (which validates node *schemas* and *workflows*) by validating a
package's *submission compliance*, which n8n-mcp does not cover.

## What you must do when invoked

### Step 1 — Build the CLI if needed
From the repo root, if `dist/` is missing:

```bash
npm ci && npm run build
```

### Step 2 — Get the package onto disk
- A local path: use it directly.
- An npm package name: this is a download. State the package, version, and that you will
  use `npm pack` (tarball only, `--ignore-scripts`, no code execution), and get the
  user's go-ahead before pulling it. Then, in a scratch dir:
  `npm pack <name> --ignore-scripts && tar -xzf <name>-*.tgz`.

### Step 3 — Run the deterministic checks
```bash
node dist/cli.js <path> --md
```
Trust the CLI's eleven rules (PKG_NAME, KEYWORD, N8N_ATTR, N8N_DIST, NO_RUNTIME_DEPS,
FILES_DIST, README, ESLINT_PLUGIN, PROVENANCE, NO_FS_ENV, DECLARATIVE). Do not re-derive
them by hand. The rule spec with sources is `docs/VETTING-RULES.md`.

### Step 4 — Do the judgment pass
Read the source for what a linter cannot decide. Spawn the `n8n-node-vetter` agent for a
focused read, or do it inline. Look for:
- unsigned webhook without verify-by-refetch (spoofing hole),
- credentials leaking into output / logs / error branches,
- request content-type never tested against the live API,
- `getAll` returning the list envelope instead of split items,
- overlap with an n8n paid/enterprise feature.
See `references/judgment-checklist.md`. Do not invent findings; if only `dist/` shipped,
scope your judgment to what is observable and say so.

### Step 5 — Write the six-section review
1. What I understood. 2. What I checked vs deferred. 3. Findings, severity-ranked, with
`file:line` and fixes. 4. Decisions I would defend. 5. What remains open. 6. The
automation angle: how a CI gate on submissions catches this class at the source.

State the verdict up front (pass / changes-needed / blocked), matching the CLI unless a
judgment finding overrides it, in which case say why.

## Honesty rules

- The CLI's PROVENANCE and NO_FS_ENV are warns because they cannot be proven offline; do
  not upgrade them to certainties. Provenance is confirmed only by the attestation on the
  npm package page.
- Never modify the node under review. This is a review, not a fix.
- No em dashes or en dashes in the written review (house style).

## Context

Background on the n8n stack, the Community Engineering squad, and the verified-node
standards is in `references/n8n-context.md`.
