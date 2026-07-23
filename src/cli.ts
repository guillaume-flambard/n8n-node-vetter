#!/usr/bin/env node
import { vetPackage } from './vetter';
import { toJson, toMarkdown, toText } from './report';

const USAGE = `n8n-node-vetter — vet a community node against n8n's verified-node standards

Usage:
  n8n-node-vetter <path-to-package> [--json | --md | --text]
  n8n-node-vetter --help

Options:
  --md      Markdown review (default)
  --json    Machine-readable JSON
  --text    Compact one-line-per-rule summary
  --strict  Exit non-zero on warnings too (default: only on hard fails)

Exit codes: 0 clean, 1 blocked (hard fail), 2 bad usage. With --strict, warnings also exit 1.`;

function main(argv: string[]): number {
	const args = argv.slice(2);
	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		console.log(USAGE);
		return args.length === 0 ? 2 : 0;
	}
	const strict = args.includes('--strict');
	const format = args.includes('--json')
		? 'json'
		: args.includes('--text')
			? 'text'
			: 'md';
	const target = args.find((a) => !a.startsWith('-'));
	if (!target) {
		console.error('Error: no package path given.\n');
		console.error(USAGE);
		return 2;
	}

	const result = vetPackage(target);
	if (format === 'json') console.log(toJson(result));
	else if (format === 'text') console.log(toText(result));
	else console.log(toMarkdown(result));

	if (result.verdict === 'blocked') return 1;
	if (strict && result.verdict === 'changes-needed') return 1;
	return 0;
}

process.exit(main(process.argv));
