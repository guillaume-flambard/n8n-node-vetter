# AGENTS.md — n8n-node-vetter

Model-agnostic entrypoint for any AI assistant (Claude, opencode, Codex, local models)
working in this repo. Claude Code also reads `CLAUDE.md`, which just includes this file.

## What this project is

A CLI that vets an n8n community node package against n8n's verified-node standards and
prints a severity-ranked review. It encodes, once, the mechanical checks a reviewer would
otherwise run by hand on every Creator Portal submission. It complements n8n-mcp (which
validates node schemas/workflows) by covering package submission compliance instead.

## How it is built

- TypeScript, Node >= 18, **zero runtime dependencies** (the tool holds itself to the bar
  it checks for). Node built-ins only.
- `src/rules/*` — each rule is a **pure function** of a `PackageContext`, returning one
  `Finding`. Rules do no I/O, so each is unit-tested in isolation (`tests/`).
- `src/pkg.ts` gathers the context once (package.json, source files, workflows, README).
- `src/vetter.ts` runs the rules and computes the verdict; `src/report.ts` renders
  markdown / json / text; `src/cli.ts` is the entry.
- The canonical rule spec, with sources and rationale, is `docs/VETTING-RULES.md`. Change a
  rule there and in `src/rules/` together.

## Working here

```bash
npm ci && npm run build        # compile to dist/
npm test                       # jest, one suite per rule
npm run lint                   # eslint
node dist/cli.js <path> --md   # vet a package directory
```

- Add a rule: write it in `src/rules/`, register it in `src/rules/index.ts`, add a test,
  and document it in `docs/VETTING-RULES.md`. Keep it a pure function.
- Deterministic rules live in the CLI. Judgment rules (webhook verification, credential
  leakage, request encoding, list envelopes, paid-feature overlap) are deliberately not in
  the CLI — they live in the `/n8n-vetting` skill and the `n8n-node-vetter` agent under
  `.claude/`.
- House style: no em dashes or en dashes in prose.

## AI assets in this repo

- `.claude/skills/n8n-vetting/` — the review playbook (`/n8n-vetting`) + references.
- `.claude/agents/n8n-node-vetter.md` — a read-only reviewer subagent.
- `examples/` — two real runs (one PASS, one BLOCKED) as a worked reference.
