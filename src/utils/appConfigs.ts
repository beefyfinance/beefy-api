import { getKey, setKey } from './cache/index.ts';
import { type ApiChain, toAppChain } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'app-configs' });

const BASE_URL = 'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config';
const CACHE_KEY_PREFIX = 'APP_CONFIG';
const CACHE_VERSION = 1;

type AppConfigFile = 'vault' | 'promos';

const fileDirs = { vault: 'vault', promos: 'promos/chain' } as const satisfies Record<AppConfigFile, string>;

type Entry = {
  /** undefined when the file does not exist */
  readonly etag: string | undefined;
  /** unchecked json */
  readonly data: readonly unknown[];
};

type CachedEntry = Entry & { readonly version: number };

const NOT_FOUND: Entry = { etag: undefined, data: [] };

function isNotFound(entry: Entry): boolean {
  return entry.etag === undefined && entry.data.length === 0;
}

const entries = new Map<string, Entry>();
const restores = new Map<string, Promise<void>>();

function getPath(file: AppConfigFile, chain: ApiChain): string {
  return `${fileDirs[file]}/${toAppChain(chain)}.json`;
}

function getCacheKey(path: string): string {
  return `${CACHE_KEY_PREFIX}:${path}`;
}

async function loadCachedEntry(path: string): Promise<void> {
  try {
    const cached = await getKey<CachedEntry>(getCacheKey(path));
    if (cached?.version === CACHE_VERSION && !entries.has(path)) {
      entries.set(path, { etag: cached.etag, data: cached.data });
    }
  } catch (err) {
    logger.debug({ err, path }, 'failed to restore app config');
  }
}

/** loads the persisted entry once per path */
function restoreEntry(path: string): Promise<void> {
  let restore = restores.get(path);
  if (!restore) {
    restore = loadCachedEntry(path);
    restores.set(path, restore);
  }
  return restore;
}

async function saveEntry(path: string, entry: Entry): Promise<void> {
  entries.set(path, entry);
  try {
    await setKey<CachedEntry>(getCacheKey(path), { version: CACHE_VERSION, ...entry });
  } catch (err) {
    logger.debug({ err, path }, 'failed to persist app config');
  }
}

/** revalidates against the stored etag; a missing file is an empty list */
async function fetchEntry(path: string): Promise<Entry> {
  const url = `${BASE_URL}/${path}`;
  await restoreEntry(path);
  const stored = entries.get(path);
  const response = await fetch(url, { headers: stored?.etag ? { 'If-None-Match': stored.etag } : undefined });

  if (response.status === 304 && stored) {
    logger.trace({ path }, 'app config not modified');
    return stored;
  }

  if (response.status === 404) {
    if (!stored || !isNotFound(stored)) {
      await saveEntry(path, NOT_FOUND);
    }
    return NOT_FOUND;
  }

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid data for ${url}`);
  }

  const entry: Entry = { etag: response.headers.get('etag') ?? undefined, data };
  await saveEntry(path, entry);
  return entry;
}

export async function fetchAppVaults(chain: ApiChain): Promise<readonly unknown[]> {
  return (await fetchEntry(getPath('vault', chain))).data;
}

export async function fetchAppPromos(chain: ApiChain): Promise<readonly unknown[]> {
  return (await fetchEntry(getPath('promos', chain))).data;
}
