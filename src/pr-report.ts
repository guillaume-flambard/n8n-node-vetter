import { toMarkdown } from './report';
import { PrReview } from './pr';
import { Verdict } from './vetter';

const VERDICT_LINE: Record<Verdict, string> = {
	pass: 'PASS — the diff is clean and the package still meets the deterministic standards.',
	'changes-needed': 'CHANGES NEEDED — the diff touches the package; resolve the warnings below.',
	blocked: 'BLOCKED — this PR breaks a hard requirement (see PR-introduced issues).',
};

/** Markdown PR review: the diff-aware header, then the full package vet. */
export function prToMarkdown(review: PrReview): string {
	const out: string[] = [];
	out.push(`# PR review: ${review.vet.packageName ?? review.root}`);
	out.push('');
	out.push(`**Verdict:** ${VERDICT_LINE[review.prVerdict]}`);
	out.push('');
	out.push(`Compared against base \`${review.base}\`.`);
	if (review.gitError) out.push(`\n> git note: ${review.gitError} — showing the package vet only.`);
	out.push('');

	out.push('## What this PR changed');
	if (review.addedRuntimeDeps.length > 0) {
		out.push(
			`- [FAIL] introduces runtime dependency(ies): ${review.addedRuntimeDeps
				.map((d) => `\`${d}\``)
				.join(', ')}. Verified nodes allow zero runtime deps. Do the work through n8n's request helpers or a declarative routing block.`,
		);
	}
	if (review.removedRuntimeDeps.length > 0) {
		out.push(`- removes runtime dependency(ies): ${review.removedRuntimeDeps.join(', ')} (good).`);
	}
	if (review.changedFiles.length > 0) {
		out.push(`- ${review.changedFiles.length} file(s) changed:`);
		for (const f of review.changedFiles.slice(0, 40)) out.push(`  - \`${f}\``);
		if (review.changedFiles.length > 40) out.push(`  - …and ${review.changedFiles.length - 40} more`);
	} else if (!review.gitError) {
		out.push('- no file changes detected against the base.');
	}
	out.push('');

	out.push('## Package standards (full vet at PR head)');
	out.push('');
	out.push(toMarkdown(review.vet));
	return out.join('\n');
}

export function prToJson(review: PrReview): string {
	return JSON.stringify(review, null, 2);
}
