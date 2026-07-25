import { Rule } from '../types';
import { make } from './util';

/** NO_RUNTIME_DEPS — verified nodes may not declare runtime dependencies. */
export const noRuntimeDeps: Rule = (ctx) => {
	const id = 'NO_RUNTIME_DEPS';
	const title = 'No runtime dependencies';
	if (!ctx.pkg) return make(id, title, 'fail', 'skip', 'No package.json to inspect.');
	const deps = ctx.pkg.dependencies;
	const names = deps && typeof deps === 'object' ? Object.keys(deps) : [];
	if (names.length === 0) {
		return make(id, title, 'fail', 'pass', 'dependencies is empty or absent.');
	}
	return make(
		id,
		title,
		'fail',
		'fail',
		`declares ${names.length} runtime dependency(ies): ${names.join(', ')}.`,
		'Remove runtime deps. Do HTTP via this.helpers.httpRequest or a declarative routing block; move build-only packages to devDependencies.',
	);
};

/** ESLINT_PLUGIN — the n8n community linter is wired up. */
export const eslintPlugin: Rule = (ctx) => {
	const id = 'ESLINT_PLUGIN';
	const title = 'ESLint n8n community ruleset is wired up';
	const dev = ctx.pkg?.devDependencies ?? {};
	const has = (name: string) => Object.prototype.hasOwnProperty.call(dev, name);
	const hasDep = has('eslint-plugin-n8n-nodes-base');
	// @n8n/node-cli is n8n's own official CLI for community nodes and depends on both
	// eslint-plugin-n8n-nodes-base and @n8n/eslint-plugin-community-nodes. Packages scaffolded
	// with it therefore lint correctly while declaring neither plugin directly, and the earlier
	// devDependency-only check warned hardest at the packages following n8n's current guidance.
	const hasCli = has('@n8n/node-cli');
	const hasCommunityPlugin = has('@n8n/eslint-plugin-community-nodes');
	const configReferences = ctx.sourceFiles.some(
		(f) => /eslintrc|eslint\.config/i.test(f.path) && /n8n-nodes-base|community-nodes/.test(f.content),
	);
	if (hasDep || hasCli || hasCommunityPlugin || configReferences) {
		let evidence: string;
		if (hasDep) evidence = 'eslint-plugin-n8n-nodes-base is a devDependency.';
		else if (hasCli) evidence = '@n8n/node-cli is a devDependency; it brings the n8n ESLint plugins.';
		else if (hasCommunityPlugin) evidence = '@n8n/eslint-plugin-community-nodes is a devDependency.';
		else evidence = 'an ESLint config extends the n8n ruleset.';
		return make(id, title, 'warn', 'pass', evidence);
	}
	return make(
		id,
		title,
		'warn',
		'warn',
		'no n8n ESLint wiring found: neither eslint-plugin-n8n-nodes-base, @n8n/node-cli, @n8n/eslint-plugin-community-nodes, nor an ESLint config extending them.',
		'Add the plugin and extend plugin:n8n-nodes-base/community (+ nodes, credentials), or scaffold with @n8n/node-cli, which brings both n8n plugins.',
	);
};
