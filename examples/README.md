# Example reviews

Two real runs of `n8n-node-vetter`, one clean, one blocked. Regenerate either with
`node dist/cli.js <path> --md`.

## `n8n-nodes-opn.review.md` — PASS

The `n8n-nodes-opn` community node (zero deps, declarative, provenance publish)
clears all eleven deterministic rules. This is what a submission-ready package looks
like to the tool.

## `n8n-nodes-puppeteer.review.md` — BLOCKED

A popular, genuinely useful community node run unseen from npm (`npm pack`, v1.5.0).
The tool blocks it for the right reason and only that reason:

- **FAIL `NO_RUNTIME_DEPS`** — six runtime dependencies (puppeteer and friends). A
  node that drives a real browser cannot be dependency-free, so it can be *installed*
  as a community node but never *verified*. That distinction is exactly what the rule
  encodes.
- **WARN `PROVENANCE`** — no CI publish path in the package.
- **WARN `NO_FS_ENV`** — thirteen `fs` / `child_process` / `process.env` references to
  review by hand.
- Correctly read as **programmatic** (`execute()`), which is the right lens for a node
  whose logic genuinely needs it.

The point of the pair: the tool green-lights a clean package and stops a
non-verifiable one at the exact line it fails, with no false alarms on the parts that
are fine.
