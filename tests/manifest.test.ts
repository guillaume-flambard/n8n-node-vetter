import { filesDist, keyword, n8nAttr, n8nDist, pkgName, readme } from '../src/rules';
import { cleanPkg, ctx } from './fixtures';

describe('PKG_NAME', () => {
	it('passes an n8n-nodes- name', () => {
		expect(pkgName(ctx({ pkg: { name: 'n8n-nodes-opn' } })).status).toBe('pass');
	});
	it('passes a scoped name', () => {
		expect(pkgName(ctx({ pkg: { name: '@acme/n8n-nodes-thing' } })).status).toBe('pass');
	});
	it('fails a non-namespaced name', () => {
		expect(pkgName(ctx({ pkg: { name: 'cool-node' } })).status).toBe('fail');
	});
	it('skips when no package.json', () => {
		expect(pkgName(ctx({ pkg: null })).status).toBe('skip');
	});
});

describe('KEYWORD', () => {
	it('passes when the community keyword is present', () => {
		expect(keyword(ctx({ pkg: { keywords: ['n8n-community-node-package'] } })).status).toBe('pass');
	});
	it('fails when missing', () => {
		expect(keyword(ctx({ pkg: { keywords: ['n8n'] } })).status).toBe('fail');
	});
	it('fails when keywords absent', () => {
		expect(keyword(ctx({ pkg: {} })).status).toBe('fail');
	});
});

describe('N8N_ATTR', () => {
	it('passes with a non-empty nodes array', () => {
		expect(n8nAttr(ctx({ pkg: { n8n: { nodes: ['dist/x.js'] } } })).status).toBe('pass');
	});
	it('fails with empty nodes', () => {
		expect(n8nAttr(ctx({ pkg: { n8n: { nodes: [] } } })).status).toBe('fail');
	});
	it('fails with no n8n attribute', () => {
		expect(n8nAttr(ctx({ pkg: {} })).status).toBe('fail');
	});
});

describe('N8N_DIST', () => {
	it('passes when all paths are under dist', () => {
		const pkg = { n8n: { nodes: ['dist/nodes/A.node.js'], credentials: ['dist/credentials/A.js'] } };
		expect(n8nDist(ctx({ pkg })).status).toBe('pass');
	});
	it('fails when a path points at source', () => {
		const pkg = { n8n: { nodes: ['nodes/A.node.ts'] } };
		expect(n8nDist(ctx({ pkg })).status).toBe('fail');
	});
	it('fails when a dist path is still .ts', () => {
		const pkg = { n8n: { nodes: ['dist/nodes/A.node.ts'] } };
		expect(n8nDist(ctx({ pkg })).status).toBe('fail');
	});
	it('skips when there is no manifest', () => {
		expect(n8nDist(ctx({ pkg: {} })).status).toBe('skip');
	});
});

describe('FILES_DIST', () => {
	it('passes when files includes dist', () => {
		expect(filesDist(ctx({ pkg: { files: ['dist'] } })).status).toBe('pass');
	});
	it('warns when files omits dist', () => {
		expect(filesDist(ctx({ pkg: { files: ['src'] } })).status).toBe('warn');
	});
	it('warns when files absent', () => {
		expect(filesDist(ctx({ pkg: {} })).status).toBe('warn');
	});
});

describe('README', () => {
	it('passes with a substantial readme', () => {
		expect(readme(ctx({ readme: 'x'.repeat(300) })).status).toBe('pass');
	});
	it('warns with a tiny readme', () => {
		expect(readme(ctx({ readme: 'too short' })).status).toBe('warn');
	});
	it('warns with no readme', () => {
		expect(readme(ctx({ readme: null })).status).toBe('warn');
	});
});

describe('clean package', () => {
	it('passes all deterministic manifest rules', () => {
		const c = ctx({ pkg: cleanPkg, readme: 'x'.repeat(300) });
		for (const rule of [pkgName, keyword, n8nAttr, n8nDist, filesDist, readme]) {
			expect(rule(c).status).toBe('pass');
		}
	});
});
