import { declarative, noFsEnv } from '../src/rules';
import { ctx } from './fixtures';

describe('NO_FS_ENV', () => {
	it('passes clean node code', () => {
		const sourceFiles = [{ path: 'nodes/A.node.ts', content: 'const x = 1;' }];
		expect(noFsEnv(ctx({ sourceFiles })).status).toBe('pass');
	});
	it('warns on process.env', () => {
		const sourceFiles = [{ path: 'nodes/A.node.ts', content: 'const k = process.env.SECRET;' }];
		const f = noFsEnv(ctx({ sourceFiles }));
		expect(f.status).toBe('warn');
		expect(f.evidence).toContain('nodes/A.node.ts');
	});
	it('warns on require fs', () => {
		const sourceFiles = [{ path: 'dist/nodes/A.node.js', content: "const fs = require('fs');" }];
		expect(noFsEnv(ctx({ sourceFiles })).status).toBe('warn');
	});
	it('ignores hits in test files while scanning product code', () => {
		const sourceFiles = [
			{ path: 'nodes/A.node.ts', content: 'const x = 1;' },
			{ path: 'tests/A.test.ts', content: 'const k = process.env.X;' },
		];
		expect(noFsEnv(ctx({ sourceFiles })).status).toBe('pass');
	});
	it('skips when there is no product code', () => {
		expect(noFsEnv(ctx({ sourceFiles: [] })).status).toBe('skip');
	});
});

describe('DECLARATIVE', () => {
	it('reports declarative style', () => {
		const sourceFiles = [{ path: 'nodes/A.node.ts', content: 'description = { routing: { request: {} } }' }];
		expect(declarative(ctx({ sourceFiles })).evidence).toMatch(/Declarative/);
	});
	it('reports programmatic style', () => {
		const sourceFiles = [{ path: 'nodes/A.node.ts', content: 'async execute() { return []; }' }];
		expect(declarative(ctx({ sourceFiles })).evidence).toMatch(/Programmatic/);
	});
	it('is always informational (status pass, severity info)', () => {
		const f = declarative(ctx({ sourceFiles: [] }));
		expect(f.severity).toBe('info');
		expect(f.status).toBe('pass');
	});
});
