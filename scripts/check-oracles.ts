import commandLineArgs from 'command-line-args';
import fg from 'fast-glob';
import { promises as fsPromises } from 'fs';
import { groupBy } from 'lodash';
import { addressBookByChainId } from '../packages/address-book/address-book';

type PoolToken = {
  address: string;
  oracleId: string;
  decimals: string;
};

type BasePool = {
  name: string;
  address: string;
  decimals?: string;
  chainId?: number;
};

type LPPool = BasePool & {
  lp0: PoolToken;
  lp1: PoolToken;
};

type Token = {
  chainId: number;
  address: string;
  decimals: string;
  oracleId: string;
  location: string;
};

const nativeToWrapped = Object.fromEntries(
  Object.values(addressBookByChainId).map(addressbook => [
    addressbook.tokens.WNATIVE.symbol.slice(1),
    addressbook.tokens.WNATIVE.symbol,
  ])
);

function areAllNative(symbols: string[]) {
  if (symbols.length !== 2) {
    return false;
  }

  const native = symbols.find(symbol => symbol in nativeToWrapped);
  if (!native) {
    return false;
  }

  return symbols.includes(nativeToWrapped[native]);
}

function isObject(item: unknown): item is Record<string | number | symbol, unknown> {
  return item && typeof item === 'object';
}

function isPoolToken(token: unknown): token is PoolToken {
  return (
    token && isObject(token) && 'address' in token && 'oracleId' in token && 'decimals' in token
  );
}

function isBasePool(pool: unknown): pool is BasePool {
  return isObject(pool) && 'name' in pool && 'address' in pool;
}

function isLPPool(pool: BasePool | LPPool): pool is LPPool {
  return 'lp0' in pool && 'lp1' in pool && isPoolToken(pool.lp0) && isPoolToken(pool.lp1);
}

async function loadString(path: string): Promise<string> {
  return await fsPromises.readFile(path, 'utf-8');
}

async function loadJson<ReturnType = unknown>(path: string): Promise<ReturnType> {
  const json = await fsPromises.readFile(path, 'utf-8');
  return JSON.parse(json);
}

async function processFile(path: string, ignorePools: boolean): Promise<Token[]> {
  const pools = await loadJson<unknown[]>(path);

  if (!pools || !Array.isArray(pools) || !pools.length) {
    console.warn(`No pools found in ${path}`);
    return [];
  }

  const tokens: Token[] = [];
  let skippedBasePool = false;

  for (const pool of pools) {
    if (!isBasePool(pool)) {
      // console.warn('not a pool', JSON.stringify(pool));
      continue;
    }

    if (ignorePools) {
      skippedBasePool = true;
    } else {
      tokens.push({
        address: pool.address.toLowerCase(),
        location: path,
        chainId: pool.chainId || 56,
        decimals: pool.decimals || '1e18',
        oracleId: pool.name,
      });
    }

    if (!isLPPool(pool)) {
      continue;
    }

    for (const key of ['lp0', 'lp1']) {
      tokens.push({
        address: pool[key].address.toLowerCase(),
        location: path,
        chainId: pool.chainId || 56,
        decimals: pool[key].decimals,
        oracleId: pool[key].oracleId,
      });
    }
  }

  if (!tokens.length && !skippedBasePool) {
    console.warn(`No supported pools found in ${path}`);
  }

  return tokens;
}

async function checkTokens(tokensForChain: Token[], ignoreNative: boolean) {
  await Promise.all([
    checkTokensByAddress(tokensForChain, ignoreNative),
    checkTokensByOracle(tokensForChain, ignoreNative),
  ]);
}

async function checkTokensByAddress(tokensForChain: Token[], ignoreNative: boolean) {
  const tokensByAddress = groupBy(tokensForChain, 'address');

  for (const tokensForAddress of Object.values(tokensByAddress)) {
    if (tokensForAddress.length < 2) {
      continue;
    }

    const tokensByDecimals = groupBy(tokensForAddress, 'decimals');
    if (Object.values(tokensByDecimals).length > 1) {
      console.error(
        `Multiple decimals for ${tokensForAddress[0].address} on ${tokensForAddress[0].chainId}`,
        tokensByDecimals
      );
    }

    const tokensByOracles = groupBy(tokensForAddress, 'oracleId');
    const oracleIds = Object.keys(tokensByOracles);
    if (oracleIds.length > 1 && (!ignoreNative || !areAllNative(oracleIds))) {
      console.error(
        `Multiple oracles for ${tokensForAddress[0].address} on ${tokensForAddress[0].chainId}`,
        summariseLocations(tokensByOracles)
      );
    }
  }
}

async function checkTokensByOracle(tokensForChain: Token[], ignoreNative: boolean) {
  const tokensByOracles = groupBy(tokensForChain, 'oracleId');

  for (const tokensForOracle of Object.values(tokensByOracles)) {
    if (tokensForOracle.length < 2) {
      continue;
    }

    const tokensByAddress = groupBy(tokensForOracle, 'address');
    const addresses = Object.keys(tokensByAddress);
    if (addresses.length > 1) {
      console.error(
        `Multiple addresses for ${tokensForOracle[0].oracleId} on ${tokensForOracle[0].chainId}`,
        summariseLocations(tokensByAddress)
      );
    }
  }
}

type LocationToken = Omit<Token, 'location'> & {
  locations: string[];
};
function summariseLocations(tokensByKey: Record<string, Token[]>): LocationToken[] {
  return Object.values(tokensByKey).map(tokens => ({
    address: tokens[0].address,
    chainId: tokens[0].chainId,
    decimals: tokens[0].decimals,
    oracleId: tokens[0].oracleId,
    locations: tokens.map(token => token.location),
  }));
}

async function getPaths(onlyAmm: boolean) {
  const paths = await fg('./src/data/**/*.json');

  if (!onlyAmm) {
    return paths;
  }

  const source = await loadString('./src/api/stats/getAmmPrices.ts');
  const regex = / from '([^']+\.json)';/gm;
  const ammPaths = new Set(
    [...source.matchAll(regex)].map(match => match[1].replace('../../data', './src/data'))
  );
  return paths.filter(path => ammPaths.has(path));
}

type RunOptions = {
  ignoreNative: boolean;
  ignorePools: boolean;
  onlyAmm: boolean;
};

async function run(options: RunOptions) {
  const paths = await getPaths(options.onlyAmm);
  const curriedProcessFile = (path: string) => processFile(path, options.ignorePools);
  const tokens = (await Promise.all(paths.map(curriedProcessFile))).flat();
  const tokensByChain = groupBy(tokens, 'chainId');
  const curriedCheckTokens = (tokens: Token[]) => checkTokens(tokens, options.ignoreNative);

  await Promise.all(Object.values(tokensByChain).map(curriedCheckTokens));
}

const options = commandLineArgs([
  { name: 'ignore-native', alias: 'n', type: Boolean },
  { name: 'ignore-pools', alias: 'p', type: Boolean },
  { name: 'only-amm', alias: 'a', type: Boolean },
  { name: 'help', alias: 'h', type: Boolean },
]);

if (options.help) {
  console.log(
    'Checks for tokens with the same address, that have different oracleId or decimals defined.'
  );
  console.log('Options:');
  console.log(
    '--ignore-native, -n\tIgnores NATIVE and WNATIVE oracleIds being defined for the same address'
  );
  console.log('--ignore-pools, -p\t\tOnly check lp0 and lp1 not the pool itself');
  console.log('--only-amm, -a\t\tOnly check json files directly imported in to getAmmPrices.ts');
  console.log('--help, -h\t\tShow this message');
} else {
  run({
    ignoreNative: options['ignore-native'],
    ignorePools: options['ignore-pools'],
    onlyAmm: options['only-amm'],
  }).catch(err => console.error(err));
}
