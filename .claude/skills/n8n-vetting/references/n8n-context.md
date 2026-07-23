# n8n context — stack, squad, standards

Background for reviewing community nodes. Facts track the official n8n docs as of 2026-07.
Verify anything load-bearing before stating it as current.

## The product and stack
- Fair-code workflow automation: visual nodes plus code. Self-hostable, no lock-in.
- Monorepo: pnpm + Turborepo, TypeScript, Node.js >= 22.
- Frontend: Vue 3 + Vite + Pinia (in-house design system).
- Backend: Express + Helmet, a TypeORM fork, SQLite/Postgres/MySQL, in-house DI (`@n8n/di`).
- AI: LangChain plus in-house SDK (agents, RAG).
- Tests: Jest + Playwright. Lint: ESLint / Biome / oxlint.
- Key packages: `cli` (server/REST), `core` (execution engine), `frontend/editor-ui`
  (Vue editor), `workflow` (expression engine), `nodes-base` (400+ integrations).

## The Community Engineering squad
- Created April 2026. Mission: make community contribution a scalable and reliable part
  of how n8n improves as a product.
- Delivered: on-time community PR review system, issue triage/routing, community node
  review + auto-release, cross-team bug fixing, hack-week facilitation.
- Feeds the AI Team the community pain-point signals.
- Values most useful in review work: We Are Builders (idea to shipped), We Do the Right
  Thing (security over convenience), We Are Early (anticipate).

## Verified community node standards (the rules the CLI encodes)
From the official submit-community-nodes standards
(https://docs.n8n.io/…/deploy-your-node/submit-community-nodes):
- Package name `n8n-nodes-*` or `@scope/n8n-nodes-*`.
- Keyword `n8n-community-node-package`.
- Nodes and credentials declared in the package.json `n8n` attribute (pointing at
  compiled `dist/`).
- Passes the linter (`eslint-plugin-n8n-nodes-base`), tested locally.
- **Verified nodes may not use any run-time dependencies.** The selective rule.
- Since 2026-05-01, verification requires publishing via GitHub Actions with a provenance
  statement (OIDC trusted publishing). Local publishes are rejected.
- README documentation required.
- n8n recommends scaffolding with the `n8n-node` CLI (`npm create @n8n/node`); needs
  `@n8n/node-cli` >= 0.23.0 for the provenance publish flow.
- n8n may reject nodes that compete with its paid/enterprise features.
- A blocklist removes malicious or harmfully low-quality nodes.

## n8n gotchas worth knowing (from running an instance)
- A green execution proves nothing: a zero-item skip reports success with no error, and
  the error workflow never fires. Runtime duration is the real health signal.
- In-memory vector stores are per-process; every restart empties them.
- ChatTrigger exposes a production endpoint only when `public: true`; the editor Chat tab
  runs in manual/test mode and bypasses that gate.
- Nodes between a Chat Trigger and an AI Agent can swallow `chatInput` and cause "No
  prompt specified".

## Reference material
- Rule spec with citations: `docs/VETTING-RULES.md` (in this repo).
- Example reviews: `examples/` (one PASS, one BLOCKED).
- Clean reference node: `n8n-nodes-opn`, public on npm and GitHub.
- Official docs: https://docs.n8n.io/integrations/community-nodes/ and
  https://docs.n8n.io/connect/create-nodes/.
