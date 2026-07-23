import { diffRuntimeDeps, reviewPr } from '../src/pr';

describe('diffRuntimeDeps', () => {
	it('detects an added runtime dependency', () => {
		const d = diffRuntimeDeps({}, { axios: '^1.0.0' });
		expect(d.added).toEqual(['axios']);
		expect(d.removed).toEqual([]);
	});

	it('detects a removed dependency', () => {
		const d = diffRuntimeDeps({ omise: '^1.0.0' }, {});
		expect(d.added).toEqual([]);
		expect(d.removed).toEqual(['omise']);
	});

	it('reports nothing when deps are unchanged', () => {
		const same = { a: '^1', b: '^2' };
		const d = diffRuntimeDeps(same, { ...same });
		expect(d.added).toEqual([]);
		expect(d.removed).toEqual([]);
	});

	it('sorts multiple added deps and ignores version bumps', () => {
		const d = diffRuntimeDeps({ a: '^1' }, { a: '^2', z: '^1', m: '^1' });
		expect(d.added).toEqual(['m', 'z']);
		expect(d.removed).toEqual([]);
	});

	it('treats missing maps as empty', () => {
		expect(diffRuntimeDeps(undefined, undefined)).toEqual({ added: [], removed: [] });
	});
});

describe('reviewPr on this repo (git unavailable base falls back cleanly)', () => {
	it('always returns the package vet even when the base ref is bogus', () => {
		const review = reviewPr(process.cwd(), 'refs/does/not/exist');
		expect(review.vet).toBeDefined();
		expect(review.vet.findings.length).toBeGreaterThan(0);
		// A nonsense base yields either a gitError or simply no added deps; never throws.
		expect(review.addedRuntimeDeps).toEqual([]);
	});
});
