#!/usr/bin/env node
import { reviewPr } from './pr';
import { prToJson, prToMarkdown } from './pr-report';

const USAGE = `n8n-pr-review — review a community node PR against the verified-node standards

Runs the deterministic node vet at the PR head, then adds the diff-aware signal a
per-package vet cannot see: which files the PR changed, and whether it introduces a
runtime dependency (which verified nodes forbid). It does not post to GitHub — it
prints a review you paste.

Usage:
  n8n-pr-review <path-to-package> [--base <ref>] [--json | --md]
  n8n-pr-review --help

Options:
  --base <ref>  Base ref to diff against (default: HEAD~1). Use the PR's target branch.
  --md          Markdown review (default)
  --json        Machine-readable JSON
  --strict      Exit non-zero on changes-needed too (default: only on blocked)

Exit codes: 0 pass, 1 blocked, 2 bad usage. With --strict, changes-needed also exits 1.`;

function main(argv: string[]): number {
	const args = argv.slice(2);
	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		console.log(USAGE);
		return args.length === 0 ? 2 : 0;
	}
	const strict = args.includes('--strict');
	const format = args.includes('--json') ? 'json' : 'md';

	let base = 'HEAD~1';
	const bi = args.indexOf('--base');
	if (bi !== -1) {
		const val = args[bi + 1];
		if (!val || val.startsWith('-')) {
			console.error('Error: --base needs a ref.\n');
			console.error(USAGE);
			return 2;
		}
		base = val;
	}

	const positional = args.filter((a, i) => !a.startsWith('-') && args[i - 1] !== '--base');
	const target = positional[0];
	if (!target) {
		console.error('Error: no package path given.\n');
		console.error(USAGE);
		return 2;
	}

	const review = reviewPr(target, base);
	console.log(format === 'json' ? prToJson(review) : prToMarkdown(review));

	if (review.prVerdict === 'blocked') return 1;
	if (strict && review.prVerdict === 'changes-needed') return 1;
	return 0;
}

process.exit(main(process.argv));
