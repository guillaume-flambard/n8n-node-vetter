import * as fs from 'fs';
import * as path from 'path';
import { PackageContext, SourceFile } from './types';

const CODE_EXT = new Set(['.ts', '.js', '.cjs', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', '.git']);

/** Recursively collect files under `dir`, skipping node_modules/.git. */
function walk(dir: string, filter: (p: string) => boolean, out: string[] = []): string[] {
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (SKIP_DIRS.has(entry.name)) continue;
			walk(full, filter, out);
		} else if (entry.isFile() && filter(full)) {
			out.push(full);
		}
	}
	return out;
}

function readSafe(file: string): string | null {
	try {
		return fs.readFileSync(file, 'utf8');
	} catch {
		return null;
	}
}

/**
 * Gather everything the rules need from a package directory. All filesystem
 * access happens here so the rules themselves stay pure and testable.
 */
export function loadPackage(root: string): PackageContext {
	const abs = path.resolve(root);

	let pkg: Record<string, any> | null = null;
	let pkgError: string | undefined;
	const pkgPath = path.join(abs, 'package.json');
	const pkgRaw = readSafe(pkgPath);
	if (pkgRaw === null) {
		pkgError = 'package.json not found';
	} else {
		try {
			pkg = JSON.parse(pkgRaw);
		} catch (e: any) {
			pkgError = `package.json is not valid JSON: ${e.message}`;
		}
	}

	const rel = (full: string) => path.relative(abs, full);

	const sourceFiles: SourceFile[] = walk(abs, (p) => CODE_EXT.has(path.extname(p)))
		.map((full) => ({ path: rel(full), content: readSafe(full) ?? '' }))
		.filter((f) => f.content !== '');

	const workflowsDir = path.join(abs, '.github', 'workflows');
	const workflows: SourceFile[] = walk(workflowsDir, (p) => /\.ya?ml$/.test(p)).map((full) => ({
		path: rel(full),
		content: readSafe(full) ?? '',
	}));

	// README.md, case-insensitive.
	let readme: string | null = null;
	const readmeEntry = walk(abs, (p) => /(^|[\\/])readme\.md$/i.test(path.basename(p)))
		.filter((p) => path.dirname(p) === abs)[0];
	if (readmeEntry) readme = readSafe(readmeEntry);

	return { root: abs, pkg, pkgError, sourceFiles, readme, workflows };
}
