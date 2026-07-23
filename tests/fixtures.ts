import { PackageContext } from '../src/types';

/** Build a PackageContext for tests with sensible empty defaults. */
export function ctx(partial: Partial<PackageContext> = {}): PackageContext {
	return {
		root: partial.root ?? '/tmp/pkg',
		pkg: partial.pkg === undefined ? {} : partial.pkg,
		pkgError: partial.pkgError,
		sourceFiles: partial.sourceFiles ?? [],
		readme: partial.readme ?? null,
		workflows: partial.workflows ?? [],
	};
}

/** A package.json that satisfies every deterministic rule. */
export const cleanPkg = {
	name: 'n8n-nodes-example',
	keywords: ['n8n-community-node-package', 'n8n'],
	files: ['dist'],
	dependencies: {},
	devDependencies: { 'eslint-plugin-n8n-nodes-base': '^1.16.1' },
	n8n: {
		n8nNodesApiVersion: 1,
		credentials: ['dist/credentials/ExampleApi.credentials.js'],
		nodes: ['dist/nodes/Example/Example.node.js'],
	},
};
