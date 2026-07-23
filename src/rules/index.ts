import { Rule } from '../types';
import { filesDist, keyword, n8nAttr, n8nDist, pkgName, readme } from './manifest';
import { eslintPlugin, noRuntimeDeps } from './deps';
import { provenance } from './provenance';
import { declarative, noFsEnv } from './source';

/**
 * The full ruleset, in report order (hard blockers first). Each rule is a pure
 * function of PackageContext and is unit-tested individually.
 */
export const RULES: Rule[] = [
	pkgName,
	keyword,
	n8nAttr,
	n8nDist,
	noRuntimeDeps,
	filesDist,
	readme,
	eslintPlugin,
	provenance,
	noFsEnv,
	declarative,
];

export {
	pkgName,
	keyword,
	n8nAttr,
	n8nDist,
	noRuntimeDeps,
	filesDist,
	readme,
	eslintPlugin,
	provenance,
	noFsEnv,
	declarative,
};
