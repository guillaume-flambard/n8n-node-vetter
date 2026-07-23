import { vetContext } from '../src/vetter';
import { toJson, toMarkdown, toText } from '../src/report';
import { cleanPkg, ctx } from './fixtures';

describe('vetContext verdict', () => {
	it('is pass on a clean package with provenance and product code', () => {
		const c = ctx({
			pkg: cleanPkg,
			readme: 'x'.repeat(300),
			sourceFiles: [{ path: 'nodes/A.node.ts', content: 'const d = { routing: {} };' }],
			workflows: [{ path: '.github/workflows/release.yml', content: 'npm publish --provenance' }],
		});
		const result = vetContext(c);
		expect(result.verdict).toBe('pass');
		expect(result.summary.fail).toBe(0);
		expect(result.summary.warn).toBe(0);
	});

	it('is blocked when a hard rule fails', () => {
		const result = vetContext(ctx({ pkg: { ...cleanPkg, dependencies: { axios: '^1' } } }));
		expect(result.verdict).toBe('blocked');
		expect(result.summary.fail).toBeGreaterThan(0);
	});

	it('is changes-needed when only warnings remain', () => {
		// clean hard rules, but no readme / no workflow / no product code → warnings
		const result = vetContext(ctx({ pkg: cleanPkg }));
		expect(result.verdict).toBe('changes-needed');
		expect(result.summary.fail).toBe(0);
		expect(result.summary.warn).toBeGreaterThan(0);
	});

	it('runs every rule exactly once', () => {
		const result = vetContext(ctx({ pkg: cleanPkg }));
		const ids = result.findings.map((f) => f.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids).toContain('NO_RUNTIME_DEPS');
		expect(ids).toContain('DECLARATIVE');
	});
});

describe('reports', () => {
	const result = vetContext(ctx({ pkg: cleanPkg }));
	it('renders markdown with a verdict', () => {
		expect(toMarkdown(result)).toContain('Verdict:');
	});
	it('renders parseable json', () => {
		expect(JSON.parse(toJson(result)).verdict).toBe(result.verdict);
	});
	it('renders compact text', () => {
		expect(toText(result)).toContain('CHANGES-NEEDED');
	});
});
