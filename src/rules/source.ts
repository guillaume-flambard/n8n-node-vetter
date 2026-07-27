import { Rule } from '../types';
import { grep, isProductCode, make } from './util';

/** NO_FS_ENV — node code should not touch the filesystem or host env. */
export const noFsEnv: Rule = (ctx) => {
	const id = 'NO_FS_ENV';
	const title = 'No filesystem or environment access in node code';
	const product = ctx.sourceFiles.filter((f) => isProductCode(f.path));
	if (product.length === 0) {
		return make(id, title, 'warn', 'skip', 'No product code files found to scan.');
	}
	const re = /require\(['"](fs|child_process)['"]\)|from\s+['"](fs|child_process)['"]|process\.env/;
	const hits = grep(product, re);
	if (hits.length === 0) {
		return make(id, title, 'warn', 'pass', `scanned ${product.length} file(s); no fs/child_process/process.env.`);
	}
	const sample = hits.slice(0, 5).map((h) => `${h.path}:${h.line} ${h.text}`);
	return make(
		id,
		title,
		'warn',
		'warn',
		`${hits.length} reference(s) to fs/child_process/process.env:\n    ${sample.join('\n    ')}`,
		'Remove filesystem/child_process/env access; take inputs via node parameters and credentials. Confirm each hit — a static scan can flag comments or strings.',
	);
};

/** DECLARATIVE — report node style (declarative routing vs programmatic execute). */
export const declarative: Rule = (ctx) => {
	const id = 'DECLARATIVE';
	const title = 'Node implementation style';
	const product = ctx.sourceFiles.filter((f) => isProductCode(f.path));
	const routing = grep(product, /\brouting\s*:/).length > 0;
	const execute = grep(product, /async\s+execute\s*\(|\bexecute\s*\(this:/).length > 0;
	let evidence: string;
	if (routing && !execute) evidence = 'Declarative (routing blocks, no execute()). Simplest to vet.';
	else if (execute && !routing) evidence = 'Programmatic (execute() method). Legitimate when logic demands it; review the HTTP calls by hand.';
	else if (routing && execute) evidence = 'Mixed: both routing and execute() present. Review the programmatic paths.';
	else evidence = 'Could not determine style from the shipped files (source may not be published).';
	return make(id, title, 'info', 'pass', evidence);
};

/**
 * LIST_ENVELOPE — a declarative list operation with no postReceive rootProperty.
 *
 * A "get many" style operation whose routing returns the API's list envelope
 * (`{ data: [...] }`, `{ items: [...] }`, `{ results: [...] }`) emits that envelope as a
 * single n8n item unless a `postReceive` rootProperty unwraps it. This is the tell that a
 * Get Many was never run against a real list. Detects the common, statically-visible case
 * (operations named getAll / get many / returnAll with no rootProperty anywhere); a list
 * endpoint hidden behind a non-list operation name still needs a human — say so.
 */
export const listEnvelope: Rule = (ctx) => {
	const id = 'LIST_ENVELOPE';
	const title = 'List operations unwrap their response envelope';
	const product = ctx.sourceFiles.filter((f) => isProductCode(f.path));
	if (product.length === 0) {
		return make(id, title, 'warn', 'skip', 'No product code files found to scan.');
	}
	const listOps = grep(product, /value:\s*['"]getAll['"]|['"]returnAll['"]|get\s+many|get\s+all/i);
	if (listOps.length === 0) {
		return make(id, title, 'warn', 'pass', 'No get-many/getAll list operation detected.');
	}
	const rootProp = grep(product, /rootProperty/i);
	if (rootProp.length > 0) {
		return make(id, title, 'warn', 'pass', `list operation(s) present and ${rootProp.length} rootProperty unwrap(s) found.`);
	}
	const sample = listOps.slice(0, 5).map((h) => `${h.path}:${h.line} ${h.text}`);
	return make(
		id,
		title,
		'warn',
		'warn',
		`${listOps.length} list operation(s) but no postReceive rootProperty anywhere:\n    ${sample.join('\n    ')}`,
		"Add a routing output postReceive of type 'rootProperty' pointing at the API's list field (data/items/results), so a list returns N items instead of one envelope. Note: an endpoint that returns a list under a non-list operation name won't be caught here — verify Get Many operations against a real multi-item response by hand.",
	);
};
