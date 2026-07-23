import { provenance } from '../src/rules';
import { ctx } from './fixtures';

describe('PROVENANCE', () => {
	it('warns when there is no workflow', () => {
		expect(provenance(ctx({ workflows: [] })).status).toBe('warn');
	});
	it('passes on an explicit --provenance publish', () => {
		const workflows = [
			{ path: '.github/workflows/release.yml', content: 'run: npm publish --provenance --access public' },
		];
		expect(provenance(ctx({ workflows })).status).toBe('pass');
	});
	it('passes on an id-token: write OIDC workflow', () => {
		const workflows = [
			{ path: '.github/workflows/release.yml', content: 'permissions:\n  id-token: write' },
		];
		expect(provenance(ctx({ workflows })).status).toBe('pass');
	});
	it('passes on the n8n node-cli release flow', () => {
		const workflows = [{ path: '.github/workflows/publish.yml', content: 'run: npm run release' }];
		expect(provenance(ctx({ workflows })).status).toBe('pass');
	});
	it('warns when a workflow exists but shows no provenance path', () => {
		const workflows = [{ path: '.github/workflows/ci.yml', content: 'run: npm test' }];
		expect(provenance(ctx({ workflows })).status).toBe('warn');
	});
});
