import { Finding, Severity, SourceFile, Status } from '../types';

/** Build a Finding; fix is only meaningful when the rule did not pass. */
export function make(
	id: string,
	title: string,
	severity: Severity,
	status: Status,
	evidence: string,
	fix = '',
): Finding {
	return {
		id,
		title,
		severity,
		status,
		evidence,
		fix: status === 'pass' || status === 'skip' ? '' : fix,
	};
}

export interface Hit {
	path: string;
	line: number;
	text: string;
}

/** Find every line across files matching `re`, returning file:line evidence. */
export function grep(files: SourceFile[], re: RegExp): Hit[] {
	const hits: Hit[] = [];
	for (const f of files) {
		const lines = f.content.split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (re.test(lines[i])) {
				hits.push({ path: f.path, line: i + 1, text: lines[i].trim() });
			}
		}
	}
	return hits;
}

/** True for files that are the vetted node's own code, not its tooling/tests. */
export function isProductCode(path: string): boolean {
	if (/(^|[\\/])(tests?|__tests__)[\\/]/i.test(path)) return false;
	const base = path.split(/[\\/]/).pop() ?? '';
	if (/\.(test|spec)\.[cm]?[jt]s$/i.test(base)) return false;
	if (/^(gulpfile|jest\.config|\.eslintrc|\.prettierrc|rollup\.config|webpack\.config)/i.test(base))
		return false;
	if (/\.d\.ts$/i.test(base)) return false;
	return true;
}
