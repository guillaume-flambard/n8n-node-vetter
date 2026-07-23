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
	const hasDep = Object.prototype.hasOwnProperty.call(dev, 'eslint-plugin-n8n-nodes-base');
	const configReferences = ctx.sourceFiles.some(
		(f) => /eslintrc/i.test(f.path) && /n8n-nodes-base/.test(f.content),
	);
	if (hasDep || configReferences) {
		return make(
			id,
			title,
			'warn',
			'pass',
			hasDep
				? 'eslint-plugin-n8n-nodes-base is a devDependency.'
				: 'an ESLint config extends the n8n-nodes-base ruleset.',
		);
	}
	return make(
		id,
		title,
		'warn',
		'warn',
		'eslint-plugin-n8n-nodes-base not found in devDependencies or ESLint config.',
		'Add the plugin and extend plugin:n8n-nodes-base/community (+ nodes, credentials), or scaffold with the n8n-node CLI.',
	);
};
