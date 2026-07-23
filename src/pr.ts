import { execFileSync } from 'child_process';
import { loadPackage } from './pkg';
import { vetContext, VetResult, Verdict } from './vetter';

export interface PrReview {
	root: string;
	base: string;
	/** Full deterministic vet of the package at its current (PR head) state. */
	vet: VetResult;
	/** Files changed since the base ref (empty if git unavailable). */
	changedFiles: string[];
	/** Runtime deps this PR introduces — the #1 verified-node breakage. */
	addedRuntimeDeps: string[];
	/** Runtime deps this PR removes (informational; usually good). */
	removedRuntimeDeps: string[];
	/** PR verdict: a new runtime dep blocks even if the base already failed elsewhere. */
	prVerdict: Verdict;
	/** Set when git could not resolve the base (shallow clone, unknown ref, not a repo). */
	gitError?: string;
}

/** Pure: which runtime deps were added / removed between two dependency maps. */
export function diffRuntimeDeps(
	base: Record<string, string> = {},
	head: Record<string, string> = {},
): { added: string[]; removed: string[] } {
	const b = new Set(Object.keys(base ?? {}));
	const h = new Set(Object.keys(head ?? {}));
	const added = [...h].filter((x) => !b.has(x)).sort();
	const removed = [...b].filter((x) => !h.has(x)).sort();
	return { added, removed };
}

function git(root: string, args: string[]): string {
	return execFileSync('git', ['-C', root, ...args], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'ignore'],
	}).trim();
}

/** Read the dependencies map from package.json at a given ref, or {} if unreadable. */
function depsAtRef(root: string, ref: string): Record<string, string> {
	try {
		const raw = git(root, ['show', `${ref}:package.json`]);
		const pkg = JSON.parse(raw);
		return pkg.dependencies && typeof pkg.dependencies === 'object' ? pkg.dependencies : {};
	} catch {
		return {};
	}
}

/**
 * Review a node package as a PR: run the full deterministic vet, then add the
 * diff-aware signal a per-package vet cannot see — what this PR changed, and
 * whether it introduced a runtime dependency (which verified nodes forbid).
 */
export function reviewPr(root: string, base = 'HEAD~1'): PrReview {
	const ctx = loadPackage(root);
	const vet = vetContext(ctx);
	const headDeps =
		ctx.pkg?.dependencies && typeof ctx.pkg.dependencies === 'object' ? ctx.pkg.dependencies : {};

	let changedFiles: string[] = [];
	let addedRuntimeDeps: string[] = [];
	let removedRuntimeDeps: string[] = [];
	let gitError: string | undefined;

	try {
		const out = git(root, ['diff', '--name-only', `${base}...HEAD`]);
		changedFiles = out ? out.split('\n').filter(Boolean) : [];
		const baseDeps = depsAtRef(root, base);
		const d = diffRuntimeDeps(baseDeps, headDeps);
		addedRuntimeDeps = d.added;
		removedRuntimeDeps = d.removed;
	} catch (e: any) {
		gitError = `could not diff against "${base}": ${e.message.split('\n')[0]}`;
	}

	const prVerdict: Verdict =
		addedRuntimeDeps.length > 0 || vet.verdict === 'blocked'
			? 'blocked'
			: vet.verdict === 'changes-needed' || changedFiles.length > 0
				? 'changes-needed'
				: 'pass';

	return {
		root: ctx.root,
		base,
		vet,
		changedFiles,
		addedRuntimeDeps,
		removedRuntimeDeps,
		prVerdict,
		gitError,
	};
}
