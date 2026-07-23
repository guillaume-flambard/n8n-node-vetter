import { Rule } from '../types';
import { make } from './util';

/** PKG_NAME — name uses the n8n-nodes- namespace. */
export const pkgName: Rule = (ctx) => {
	const id = 'PKG_NAME';
	const title = 'Package name uses the n8n-nodes- namespace';
	if (!ctx.pkg) return make(id, title, 'fail', 'skip', 'No package.json to inspect.');
	const name = ctx.pkg.name;
	if (typeof name === 'string' && /^(@[^/]+\/)?n8n-nodes-.+/.test(name)) {
		return make(id, title, 'fail', 'pass', `name "${name}" matches ^(@scope/)?n8n-nodes-.`);
	}
	return make(
		id,
		title,
		'fail',
		'fail',
		`name "${name ?? '(missing)'}" does not match ^(@scope/)?n8n-nodes-.`,
		'Rename the package to n8n-nodes-<x> or @scope/n8n-nodes-<x>.',
	);
};

/** KEYWORD — n8n-community-node-package keyword present. */
export const keyword: Rule = (ctx) => {
	const id = 'KEYWORD';
	const title = 'Declares the n8n-community-node-package keyword';
	if (!ctx.pkg) return make(id, title, 'fail', 'skip', 'No package.json to inspect.');
	const kw = ctx.pkg.keywords;
	if (Array.isArray(kw) && kw.includes('n8n-community-node-package')) {
		return make(id, title, 'fail', 'pass', 'keywords include "n8n-community-node-package".');
	}
	return make(
		id,
		title,
		'fail',
		'fail',
		`keywords ${Array.isArray(kw) ? JSON.stringify(kw) : '(missing)'} lack "n8n-community-node-package".`,
		'Add "n8n-community-node-package" to the keywords array.',
	);
};

/** N8N_ATTR — package.json has an n8n manifest with at least one node. */
export const n8nAttr: Rule = (ctx) => {
	const id = 'N8N_ATTR';
	const title = 'Declares nodes in the package.json n8n attribute';
	if (!ctx.pkg) return make(id, title, 'fail', 'skip', 'No package.json to inspect.');
	const n8n = ctx.pkg.n8n;
	if (n8n && Array.isArray(n8n.nodes) && n8n.nodes.length > 0) {
		const creds = Array.isArray(n8n.credentials) ? n8n.credentials.length : 0;
		return make(
			id,
			title,
			'fail',
			'pass',
			`n8n.nodes lists ${n8n.nodes.length} node(s), ${creds} credential(s).`,
		);
	}
	return make(
		id,
		title,
		'fail',
		'fail',
		'package.json has no n8n.nodes array (or it is empty).',
		'Add "n8n": { "n8nNodesApiVersion": 1, "nodes": ["dist/..."], "credentials": [...] }.',
	);
};

/** N8N_DIST — every n8n manifest path points at compiled dist output. */
export const n8nDist: Rule = (ctx) => {
	const id = 'N8N_DIST';
	const title = 'n8n manifest points at compiled dist output';
	if (!ctx.pkg) return make(id, title, 'fail', 'skip', 'No package.json to inspect.');
	const n8n = ctx.pkg.n8n;
	if (!n8n || (!Array.isArray(n8n.nodes) && !Array.isArray(n8n.credentials))) {
		return make(id, title, 'fail', 'skip', 'No n8n manifest paths to check (see N8N_ATTR).');
	}
	const paths: string[] = [
		...(Array.isArray(n8n.nodes) ? n8n.nodes : []),
		...(Array.isArray(n8n.credentials) ? n8n.credentials : []),
	];
	const bad = paths.filter((p) => {
		const norm = p.replace(/^\.\//, '');
		return !norm.startsWith('dist/') || /\.ts$/.test(norm);
	});
	if (bad.length === 0) {
		return make(id, title, 'fail', 'pass', `all ${paths.length} manifest path(s) resolve under dist/.`);
	}
	return make(
		id,
		title,
		'fail',
		'fail',
		`manifest points at non-dist or source paths: ${bad.join(', ')}.`,
		'Point every n8n.nodes / n8n.credentials entry at dist/...js and build before publishing.',
	);
};

/** FILES_DIST — published tarball ships the dist directory. */
export const filesDist: Rule = (ctx) => {
	const id = 'FILES_DIST';
	const title = 'Published tarball ships the dist directory';
	if (!ctx.pkg) return make(id, title, 'warn', 'skip', 'No package.json to inspect.');
	const files = ctx.pkg.files;
	if (Array.isArray(files) && files.some((f: string) => /^\.?\/?dist\/?$/.test(f))) {
		return make(id, title, 'warn', 'pass', 'files field includes "dist".');
	}
	return make(
		id,
		title,
		'warn',
		'warn',
		`files field ${Array.isArray(files) ? JSON.stringify(files) : '(missing)'} does not include dist.`,
		'Set "files": ["dist"] so npm publish ships the compiled output n8n loads.',
	);
};

/** README — a non-trivial README ships with the package. */
export const readme: Rule = (ctx) => {
	const id = 'README';
	const title = 'Ships user-facing documentation (README)';
	if (ctx.readme && ctx.readme.trim().length > 200) {
		return make(id, title, 'warn', 'pass', `README.md present (${ctx.readme.length} chars).`);
	}
	return make(
		id,
		title,
		'warn',
		'warn',
		ctx.readme ? 'README.md is present but very short (< 200 chars).' : 'No README.md found.',
		'Add a README covering what the node does, credential setup, and each operation.',
	);
};
