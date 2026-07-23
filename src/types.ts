export type Severity = 'fail' | 'warn' | 'info';

export type Status = 'pass' | 'fail' | 'warn' | 'skip';

export interface Finding {
	/** Stable rule id, e.g. NO_RUNTIME_DEPS. */
	id: string;
	/** One-line human title. */
	title: string;
	/** How bad a failure of this rule is for verification. */
	severity: Severity;
	/** Outcome of running the rule against this package. */
	status: Status;
	/** What the check saw — the concrete evidence. */
	evidence: string;
	/** How to make it pass. Empty when status is pass. */
	fix: string;
}

export interface SourceFile {
	/** Path relative to the package root. */
	path: string;
	content: string;
}

/**
 * Everything a rule needs, gathered once by the loader so rules stay pure and
 * do no I/O themselves (which keeps them trivially unit-testable).
 */
export interface PackageContext {
	/** Absolute package root. */
	root: string;
	/** Parsed package.json, or null if missing/unparseable. */
	pkg: Record<string, any> | null;
	/** Set when package.json could not be read or parsed. */
	pkgError?: string;
	/** All .ts/.js under the package (excluding node_modules), source and dist. */
	sourceFiles: SourceFile[];
	/** README.md contents, or null when absent. */
	readme: string | null;
	/** Workflow files under .github/workflows. */
	workflows: SourceFile[];
}

export type Rule = (ctx: PackageContext) => Finding;
