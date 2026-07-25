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
		// Default to a repo checkout, the case most rules are written for. Pass [] to model an
		// unpacked npm tarball, where repo-only files cannot exist.
		repoMarkers: partial.repoMarkers ?? ['.git'],
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
