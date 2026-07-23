# n8n-node-vetter

[![npm](https://img.shields.io/npm/v/n8n-node-vetter.svg)](https://www.npmjs.com/package/n8n-node-vetter)
[![CI](https://github.com/guillaume-flambard/n8n-node-vetter/actions/workflows/ci.yml/badge.svg)](https://github.com/guillaume-flambard/n8n-node-vetter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.10-brightgreen.svg)](package.json)
[![runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](tsconfig.json)

Vet a community node package against n8n's verified-node standards, and get a
severity-ranked review back. Runnable by any contributor before they submit to the
[Creator Portal](https://creators.n8n.io/nodes), and by a reviewer on any submission.

It answers one question mechanically: **would this package clear the verified-node
requirements, and if not, exactly where does it fall short?**

## Why

n8n's Community Engineering squad reviews community node submissions and runs an
auto-release pipeline. Most rejections come down to a short list of concrete,
checkable things: the package name namespace, the `n8n-community-node-package`
keyword, the manifest pointing at `dist/`, **zero runtime dependencies**, a
provenance publish. Those are the rules the linter and reviewer apply by hand every
time. This tool encodes them once so the check runs in a second, the same way for
everyone, and can sit in CI on every submission.

It complements [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) rather than
overlapping it: n8n-mcp validates node *schemas and workflows*; this validates a
*package's submission compliance* — a different gate.

## Install / run

No runtime dependencies. Build once, then point it at a package directory (a repo
checkout or an unpacked npm tarball):

```bash
npm ci && npm run build
node dist/cli.js /path/to/some-community-node
```

Output formats:

```bash
node dist/cli.js ./pkg            # markdown review (default)
node dist/cli.js ./pkg --text     # one line per rule, for a terminal
node dist/cli.js ./pkg --json     # machine-readable, for CI
node dist/cli.js ./pkg --strict   # exit non-zero on warnings too
```

## Reviewing a PR

`n8n-pr-review` runs the same deterministic vet at the PR head, then adds the one
signal a per-package vet can't see: **what the PR changed**, and whether it
**introduces a runtime dependency** — the single most common way a community-node PR
breaks the verified-node bar. It reads the diff from git; it does not post to GitHub,
it prints a review you paste.

```bash
node dist/pr-cli.js /path/to/node-repo --base main   # diff against the PR's target
node dist/pr-cli.js ./repo --base HEAD~1 --json       # machine-readable
```

A PR that adds a runtime dependency is reported `BLOCKED` with the dep named, and exits
non-zero — ready to gate in CI on every node PR.

Exit codes: `0` clean, `1` blocked (a hard requirement fails), `2` bad usage. With
`--strict`, warnings also exit `1` — wire that into CI to hold the bar.

## CI gate (GitHub Action)

The repo ships a composite action so a node repo can vet itself on every push and PR,
turning the reviewer checklist into a gate a class of failure can't get past:

```yaml
# .github/workflows/vet.yml in a community-node repo
name: vet
on: [push, pull_request]
jobs:
  vet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: guillaume-flambard/n8n-node-vetter@v0.1.1   # pin a tag in production
        with:
          path: '.'
          strict: 'false'   # 'true' to fail on warnings too
```

It runs the published, provenance-signed package via `npx`, so there is nothing to build.
A hard-fail exits non-zero and fails the check.

## What it checks

Deterministic rules (this tool decides pass/fail):

| Rule | Severity | Checks |
|------|----------|--------|
| `PKG_NAME` | fail | name is `n8n-nodes-*` or `@scope/n8n-nodes-*` |
| `KEYWORD` | fail | `n8n-community-node-package` keyword present |
| `N8N_ATTR` | fail | `package.json` `n8n` attribute lists nodes |
| `N8N_DIST` | fail | manifest points at compiled `dist/`, not source |
| `NO_RUNTIME_DEPS` | fail | no runtime dependencies (the selective one) |
| `FILES_DIST` | warn | `files` ships `dist` in the tarball |
| `README` | warn | user-facing documentation present |
| `ESLINT_PLUGIN` | warn | `eslint-plugin-n8n-nodes-base` wired up |
| `PROVENANCE` | warn | CI publish path with provenance exists |
| `NO_FS_ENV` | warn | node code avoids `fs` / `child_process` / `process.env` |
| `DECLARATIVE` | info | declarative routing vs programmatic `execute()` |

Judgment rules the tool deliberately does **not** rule on — they need a human or an
LLM reviewer, and the [`/n8n-vetting`](.claude/skills/n8n-vetting/SKILL.md) playbook
covers them: unsigned-webhook verify-by-refetch, credential leakage, request
content-type tested against the live API, `getAll` returning the list envelope
instead of items, and overlap with n8n's paid features.

The full rule spec, with sources and rationale, is in
[`docs/VETTING-RULES.md`](docs/VETTING-RULES.md).

## Claude Code integration (ships with the repo)

The repo carries its own Claude Code assets under [`.claude/`](.claude), so cloning
gets the whole workflow, not just the binary:

- **Skill** [`.claude/skills/n8n-vetting`](.claude/skills/n8n-vetting/SKILL.md) — the
  `/n8n-vetting` review playbook (deterministic run, judgment pass, six-section review),
  with `references/` holding the judgment checklist and an n8n context brief.
- **Agent** [`.claude/agents/n8n-node-vetter.md`](.claude/agents/n8n-node-vetter.md) — a
  read-only reviewer that runs the CLI and adds the judgment layer.

Run Claude Code from the repo root and both are discovered automatically; all their
paths are repo-relative. The tool itself is a plain CLI and needs none of this.

## Design

- **Zero runtime dependencies**, Node built-ins only. The tool holds itself to the
  bar it checks for.
- Rules are **pure functions** of a `PackageContext` gathered once by the loader, so
  each rule is unit-tested in isolation.
- Published from CI with provenance (`release.yml`) — the same path it asks of the
  packages it vets.

## Sources

Rules track the official docs (submit-community-nodes standards, verified-install,
blocklist) and patterns from shipping the `n8n-nodes-opn` community node. See
`docs/VETTING-RULES.md` for the per-rule citations.
