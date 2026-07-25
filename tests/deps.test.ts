import { eslintPlugin, noRuntimeDeps } from '../src/rules';
import { ctx } from './fixtures';

describe('NO_RUNTIME_DEPS', () => {
	it('passes with no dependencies', () => {
		expect(noRuntimeDeps(ctx({ pkg: {} })).status).toBe('pass');
	});
	it('passes with an empty dependencies object', () => {
		expect(noRuntimeDeps(ctx({ pkg: { dependencies: {} } })).status).toBe('pass');
	});
	it('fails with a runtime dependency', () => {
		const f = noRuntimeDeps(ctx({ pkg: { dependencies: { axios: '^1.0.0' } } }));
		expect(f.status).toBe('fail');
		expect(f.evidence).toContain('axios');
	});
	it('ignores devDependencies and peerDependencies', () => {
		const pkg = { devDependencies: { jest: '*' }, peerDependencies: { 'n8n-workflow': '*' } };
		expect(noRuntimeDeps(ctx({ pkg })).status).toBe('pass');
	});
});

describe('ESLINT_PLUGIN', () => {
	it('passes when the plugin is a devDependency', () => {
		const pkg = { devDependencies: { 'eslint-plugin-n8n-nodes-base': '^1.16.1' } };
		expect(eslintPlugin(ctx({ pkg })).status).toBe('pass');
	});
	it('passes when an eslintrc references the ruleset', () => {
		const sourceFiles = [{ path: '.eslintrc.js', content: "extends: ['plugin:n8n-nodes-base/community']" }];
		expect(eslintPlugin(ctx({ pkg: {}, sourceFiles })).status).toBe('pass');
	});
	it('passes when scaffolded with @n8n/node-cli, which brings the n8n plugins', () => {
		// 38 of the 48 packages this rule warned at in the top-100 sweep were on @n8n/node-cli,
		// n8n's own official CLI. It depends on eslint-plugin-n8n-nodes-base directly, so the
		// old devDependency-only check warned hardest at the packages doing it the current way.
		const pkg = { devDependencies: { '@n8n/node-cli': '^0.40.3' } };
		const f = eslintPlugin(ctx({ pkg }));
		expect(f.status).toBe('pass');
		expect(f.evidence).toContain('@n8n/node-cli');
	});
	it('passes on @n8n/eslint-plugin-community-nodes', () => {
		const pkg = { devDependencies: { '@n8n/eslint-plugin-community-nodes': '^1.0.0' } };
		expect(eslintPlugin(ctx({ pkg })).status).toBe('pass');
	});
	it('passes when a flat eslint.config references the community ruleset', () => {
		const sourceFiles = [
			{ path: 'eslint.config.mjs', content: "import n8n from '@n8n/eslint-plugin-community-nodes'" },
		];
		expect(eslintPlugin(ctx({ pkg: {}, sourceFiles })).status).toBe('pass');
	});
	it('warns when no n8n eslint wiring is present', () => {
		const pkg = { devDependencies: { eslint: '^9.0.0' } };
		expect(eslintPlugin(ctx({ pkg })).status).toBe('warn');
	});
});
