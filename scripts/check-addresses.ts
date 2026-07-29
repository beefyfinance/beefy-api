import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { getAddress } from 'viem';

/** Matches quoted 20-byte hex address that is the *entire* string literal. */
const ADDRESS_RE = /(?<=['"`])0x[0-9a-fA-F]{40}(?=['"`])/g;
const ROOT = path.resolve(import.meta.dirname, '..');
/** Trees whose address literals are data. Anything outside these is left alone. */
const SCAN_DIRS = ['src', 'packages/address-book/src'];
const EXTENSIONS = ['.ts', '.json'];
const REPORTERS = ['default', 'github'] as const;

type Reporter = (typeof REPORTERS)[number];

type Options = {
  fix: boolean;
  reporter: Reporter;
  staged: boolean;
  since: string | undefined;
  paths: string[];
};

type Finding = {
  file: string;
  line: number;
  column: number;
  found: string;
  expected: string;
};

const USAGE = `Usage: check-addresses [options] [paths...]

Checks that every address literal is EIP-55 checksummed, in:
${SCAN_DIRS.map(dir => `  ${dir}/`).join('\n')}
Checks every file in those trees unless a selector is given.
A path may be a file or a directory.

Options:
  --fix              Rewrite non-checksummed addresses in place
  --staged           Only check files staged in git
  --since=<ref>      Only check files changed since <ref>
  --reporter=<name>  Output format: ${REPORTERS.join(' | ')} (default: default)
  -h, --help         Show this message`;

/** Bad flags are the user's typo, not a crash -- reported without a stack trace. */
class UsageError extends Error {}

function isReporter(value: string): value is Reporter {
  return (REPORTERS as readonly string[]).includes(value);
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    fix: false,
    reporter: 'default',
    staged: false,
    since: undefined,
    paths: [],
  };

  for (const arg of argv) {
    if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--staged') {
      options.staged = true;
    } else if (arg.startsWith('--since=')) {
      options.since = arg.slice('--since='.length);
    } else if (arg.startsWith('--reporter=')) {
      const reporter = arg.slice('--reporter='.length);
      if (!isReporter(reporter)) {
        throw new UsageError(`Unknown reporter '${reporter}', expected one of: ${REPORTERS.join(', ')}`);
      }
      options.reporter = reporter;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith('-')) {
      throw new UsageError(`Unknown option '${arg}'\n\n${USAGE}`);
    } else {
      options.paths.push(arg);
    }
  }

  const selectors = [options.staged, options.since !== undefined, options.paths.length > 0];
  if (selectors.filter(Boolean).length > 1) {
    throw new UsageError('Use only one of --staged, --since=<ref>, or explicit file paths');
  }

  return options;
}

/**
 * Callers hand us whatever their side filtered to -- lefthook's staged set, a CI diff -- so the
 * scope of this check lives here rather than in each caller.
 */
function toCheckableRelativePath(file: string): string | undefined {
  const relative = path.relative(ROOT, path.resolve(file));
  const scanned = SCAN_DIRS.some(dir => relative === dir || relative.startsWith(`${dir}${path.sep}`));
  if (!scanned || !EXTENSIONS.includes(path.extname(relative))) {
    return undefined;
  }
  return relative.split(path.sep).join('/');
}

function toCheckable(files: string[]): string[] {
  return [...new Set(files.flatMap(file => toCheckableRelativePath(file) ?? []))].sort();
}

/** `-z` so that quoted/unicode paths come back verbatim rather than escaped. */
function gitFiles(args: string[]): string[] {
  const stdout = execFileSync('git', [...args, '-z', '--', ...SCAN_DIRS], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout.split('\0').filter(Boolean);
}

function isUsableRef(ref: string): boolean {
  if (ref === '' || /^0+$/.test(ref)) {
    return false;
  }
  try {
    execFileSync('git', ['cat-file', '-e', `${ref}^{commit}`], { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function globPattern(dir: string): string {
  const extensions = EXTENSIONS.map(extension => extension.slice(1)).join(',');
  return dir ? `${dir}/**/*.{${extensions}}` : `**/*.{${extensions}}`;
}

async function allFiles(): Promise<string[]> {
  const matches = await fg(SCAN_DIRS.map(globPattern), { cwd: ROOT, onlyFiles: true });
  return matches.sort();
}

/** A directory argument stands for everything under it, so callers can scope to one tree. */
async function expandPaths(paths: string[]): Promise<string[]> {
  const expanded: string[] = [];

  for (const candidate of paths) {
    const absolute = path.resolve(candidate);
    const directory = await stat(absolute)
      .then(stats => stats.isDirectory())
      .catch(() => false);

    if (directory) {
      const relative = path.relative(ROOT, absolute).split(path.sep).join('/');
      expanded.push(...(await fg(globPattern(relative), { cwd: ROOT, onlyFiles: true })));
    } else {
      expanded.push(candidate);
    }
  }

  return expanded;
}

async function resolveFiles(options: Options): Promise<string[]> {
  if (options.staged) {
    return toCheckable(gitFiles(['diff', '--name-only', '--cached', '--diff-filter=ACMR']));
  }

  if (options.since !== undefined) {
    // might be first commit or ref that no longer exists
    if (!isUsableRef(options.since)) {
      console.warn('No usable base commit for --since, checking all files.');
      return allFiles();
    }
    return toCheckable(gitFiles(['diff', '--name-only', '--diff-filter=ACMR', `${options.since}...HEAD`]));
  }

  if (options.paths.length > 0) {
    return toCheckable(await expandPaths(options.paths));
  }

  return allFiles();
}

function findBadAddresses(file: string, contents: string): Finding[] {
  const findings: Finding[] = [];

  for (const [index, line] of contents.split('\n').entries()) {
    for (const match of line.matchAll(ADDRESS_RE)) {
      const found = match[0];
      const expected = getAddress(found);
      if (found !== expected) {
        findings.push({ file, line: index + 1, column: match.index + 1, found, expected });
      }
    }
  }

  return findings;
}

async function readIfExists(absolute: string): Promise<string | undefined> {
  try {
    return await readFile(absolute, 'utf8');
  } catch (err) {
    // a caller's file list can name something already gone (a rename's old path, say)
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return undefined;
    }
    throw err;
  }
}

function report(findings: Finding[], reporter: Reporter) {
  for (const { file, line, column, found, expected } of findings) {
    const message = `Address is not checksummed, expected ${expected}`;
    if (reporter === 'github') {
      const span = `line=${line},endLine=${line},col=${column},endColumn=${column + found.length}`;
      console.log(`::error title=Address checksum,file=${file},${span}::${message}`);
    } else {
      console.error(`${file}:${line}:${column}: ${message}`);
    }
  }

  const fileCount = new Set(findings.map(finding => finding.file)).size;
  const addresses = `${findings.length} non-checksummed address${findings.length === 1 ? '' : 'es'}`;
  console.error(`\n${addresses} in ${fileCount} file${fileCount === 1 ? '' : 's'}`);
  console.error('Run `pnpm run check-addresses:fix` to rewrite them.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = await resolveFiles(options);

  if (files.length === 0) {
    console.log('No files to check.');
    return;
  }

  const findings: Finding[] = [];
  let fixedFiles = 0;

  for (const file of files) {
    const absolute = path.resolve(ROOT, file);
    const contents = await readIfExists(absolute);
    if (contents === undefined) {
      continue;
    }

    const fileFindings = findBadAddresses(file, contents);
    if (fileFindings.length === 0) {
      continue;
    }

    if (options.fix) {
      await writeFile(
        absolute,
        contents.replace(ADDRESS_RE, match => getAddress(match))
      );
      fixedFiles++;
      console.log(`Fixed ${fileFindings.length} address(es) in ${file}`);
    } else {
      findings.push(...fileFindings);
    }
  }

  if (options.fix) {
    console.log(fixedFiles === 0 ? 'No addresses to fix.' : `Fixed ${fixedFiles} file(s).`);
    return;
  }

  if (findings.length === 0) {
    console.log(`All addresses in ${files.length} file(s) pass checksum test.`);
    return;
  }

  report(findings, options.reporter);
  process.exitCode = 1;
}

try {
  await main();
} catch (err) {
  if (err instanceof UsageError) {
    console.error(err.message);
    process.exitCode = 1;
  } else {
    throw err;
  }
}
