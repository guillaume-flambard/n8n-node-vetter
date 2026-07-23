import { Rule } from '../types';
import { make } from './util';

/**
 * PROVENANCE — a GitHub Actions workflow publishes with provenance.
 *
 * Definitive proof is the attestation on the npm registry; offline we can only
 * confirm the repo carries a publishing path that would produce it. Hence warn,
 * not fail: a pass here means "the path exists", still confirm on npm.
 */
export const provenance: Rule = (ctx) => {
	const id = 'PROVENANCE';
	const title = 'Publishes via GitHub Actions with provenance';
	if (ctx.workflows.length === 0) {
		return make(
			id,
			title,
			'warn',
			'warn',
			'no .github/workflows/*.yml found.',
			'Add the n8n-nodes-starter publish.yml (or an OIDC release.yml with id-token: write and npm publish --provenance) and set a Trusted Publisher on npmjs.com.',
		);
	}
	const blob = ctx.workflows.map((w) => w.content).join('\n');
	const signals = [
		{ re: /--provenance/, label: 'npm publish --provenance' },
		{ re: /id-token:\s*write/, label: 'id-token: write permission' },
		{ re: /@n8n\/node-cli|npm run release/, label: 'n8n node-cli release flow' },
		{ re: /n8n-nodes-starter/, label: 'n8n-nodes-starter publish workflow' },
	];
	const found = signals.filter((s) => s.re.test(blob)).map((s) => s.label);
	if (found.length > 0) {
		return make(
			id,
			title,
			'warn',
			'pass',
			`workflow shows: ${found.join('; ')}. Confirm the attestation appears on the npm package page.`,
		);
	}
	return make(
		id,
		title,
		'warn',
		'warn',
		'workflows exist but none show a provenance publish path.',
		'Publish from CI with npm publish --provenance and id-token: write (required for Creator Portal since 2026-05-01).',
	);
};
