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
	it('warns when neither is present', () => {
		expect(eslintPlugin(ctx({ pkg: { devDependencies: {} } })).status).toBe('warn');
	});
});
