import { loadPackage } from './pkg';
import { RULES } from './rules';
import { Finding, PackageContext } from './types';

export type Verdict = 'pass' | 'changes-needed' | 'blocked';

export interface Summary {
	fail: number;
	warn: number;
	pass: number;
	info: number;
	skip: number;
}

export interface VetResult {
	root: string;
	packageName: string | null;
	pkgError?: string;
	findings: Finding[];
	summary: Summary;
	verdict: Verdict;
}

function summarize(findings: Finding[]): Summary {
	const s: Summary = { fail: 0, warn: 0, pass: 0, info: 0, skip: 0 };
	for (const f of findings) {
		if (f.status === 'skip') s.skip++;
		else if (f.status === 'fail') s.fail++;
		else if (f.status === 'warn') s.warn++;
		else if (f.severity === 'info') s.info++;
		else s.pass++;
	}
	return s;
}

function verdictOf(summary: Summary): Verdict {
	if (summary.fail > 0) return 'blocked';
	if (summary.warn > 0) return 'changes-needed';
	return 'pass';
}

/** Run every rule against an already-loaded context. Pure; no I/O. */
export function vetContext(ctx: PackageContext): VetResult {
	const findings = RULES.map((rule) => rule(ctx));
	const summary = summarize(findings);
	return {
		root: ctx.root,
		packageName: (ctx.pkg?.name as string) ?? null,
		pkgError: ctx.pkgError,
		findings,
		summary,
		verdict: verdictOf(summary),
	};
}

/** Load a package directory and vet it. */
export function vetPackage(root: string): VetResult {
	return vetContext(loadPackage(root));
}
