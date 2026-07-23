import { Finding, Status } from './types';
import { VetResult, Verdict } from './vetter';

const STATUS_LABEL: Record<Status, string> = {
	pass: 'PASS',
	fail: 'FAIL',
	warn: 'WARN',
	skip: 'SKIP',
};

const VERDICT_LINE: Record<Verdict, string> = {
	pass: 'PASS — meets the deterministic verified-node standards.',
	'changes-needed': 'CHANGES NEEDED — no hard blockers, but warnings to resolve or confirm.',
	blocked: 'BLOCKED — one or more hard requirements fail. Verification would be rejected.',
};

/** Human-readable markdown review. */
export function toMarkdown(result: VetResult): string {
	const { summary } = result;
	const out: string[] = [];
	out.push(`# Vetting review: ${result.packageName ?? result.root}`);
	out.push('');
	out.push(`**Verdict:** ${VERDICT_LINE[result.verdict]}`);
	out.push('');
	if (result.pkgError) {
		out.push(`> package.json problem: ${result.pkgError}`);
		out.push('');
	}
	out.push(
		`**Summary:** ${summary.fail} fail · ${summary.warn} warn · ${summary.pass} pass · ${summary.info} info · ${summary.skip} skip`,
	);
	out.push('');

	const order: Status[] = ['fail', 'warn', 'pass', 'skip'];
	const sorted = [...result.findings].sort(
		(a, b) => order.indexOf(a.status) - order.indexOf(b.status),
	);

	for (const f of sorted) {
		out.push(formatFinding(f));
	}
	out.push('');
	out.push('---');
	out.push('');
	out.push(
		'_Deterministic checks only. Judgment rules (webhook verification, credential leakage, request encoding, list envelopes, paid-feature overlap) still need a human or AI review — see the /n8n-vetting playbook._',
	);
	out.push('');
	return out.join('\n');
}

function formatFinding(f: Finding): string {
	const lines: string[] = [];
	lines.push(`## [${STATUS_LABEL[f.status]}] ${f.id} — ${f.title}`);
	lines.push(`- Severity: ${f.severity}`);
	lines.push(`- Evidence: ${f.evidence}`);
	if (f.fix) lines.push(`- Fix: ${f.fix}`);
	lines.push('');
	return lines.join('\n');
}

/** Machine-readable JSON. */
export function toJson(result: VetResult): string {
	return JSON.stringify(result, null, 2);
}

/** Compact one-line-per-rule text for a terminal. */
export function toText(result: VetResult): string {
	const out: string[] = [];
	out.push(`${result.packageName ?? result.root}: ${result.verdict.toUpperCase()}`);
	const order: Status[] = ['fail', 'warn', 'pass', 'skip'];
	const sorted = [...result.findings].sort(
		(a, b) => order.indexOf(a.status) - order.indexOf(b.status),
	);
	for (const f of sorted) {
		out.push(`  [${STATUS_LABEL[f.status].padEnd(4)}] ${f.id.padEnd(16)} ${f.evidence.split('\n')[0]}`);
	}
	return out.join('\n');
}
