import { execFileSync } from 'node:child_process';
import { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { ChainId } from '@beefyfinance/blockchain-addressbook/types/chainid';
import fg from 'fast-glob';
import { groupBy } from 'lodash-es';
import { type Client, parseAbi } from 'viem';
import { readContract } from 'viem/actions';
import {
  type AnyCowClm,
  type CowClmWithRewardPool,
  type CowClmWithVault,
  isCowClmWithRewardPool,
  isCowClmWithVault,
  type JsonCowClm,
  validateCowClms,
} from '../src/api/cowcentrated/types.ts';
import { getRPCClient } from '../src/api/rpc/client.ts';
import { type ApiChain, isApiChain, SupportedChains } from '../src/utils/chain.ts';
import { retryPromiseWithBackOff, withTimeout } from '../src/utils/promise.ts';

/**
 * This script checks the beefyCowVaults.json configs against the on-chain contracts.
 * Will throw if the local validateCowClms fails; or if a RPC call fails.
 * Otherwise, will print out any mismatches between config and contract.
 */

const ROOT = path.resolve(import.meta.dirname, '..');
const CLM_GLOB = 'src/data/**/beefyCowVaults.json';
const FILE_CONCURRENCY = 4;
const CLM_CONCURRENCY = 4;
const RPC_TIMEOUT_MS = 15_000;
const RPC_RETRY_DELAY_MS = 500;
const RPC_RETRY_LIMIT = 3;

type Options = {
  staged: boolean;
  paths: string[];
};

async function start() {
  const supported = new Set<ApiChain>(SupportedChains);
  const clmFiles = (await resolveFiles(parseArgs(process.argv.slice(2)))).filter(file =>
    supported.has(extractChainIdFromPath(file))
  );

  if (clmFiles.length === 0) {
    console.log('No CLM files to check.');
    return 0;
  }

  const errorsPerFile = await mapWithConcurrency(clmFiles, FILE_CONCURRENCY, checkFile);
  const totalErrors = errorsPerFile.reduce((acc, { errors }) => acc + errors.length, 0);

  for (const { apiChain, errors } of errorsPerFile) {
    if (errors.length === 0) {
      continue;
    }

    const byOracleId = groupBy(errors, 'oracleId');
    console.log(`\n= ${apiChain}`);
    for (const [oracleId, error] of Object.entries(byOracleId)) {
      console.log(`>> ${oracleId}`);
      for (const e of error) {
        console.log(`--- ${e.error}`);
      }
    }
  }

  if (totalErrors > 0) {
    console.log(`\nTotal errors: ${totalErrors}`);
  }

  return totalErrors === 0 ? 0 : 1;
}

const resolveUndefined = Promise.resolve(undefined);

function parseArgs(argv: string[]): Options {
  const options: Options = {
    staged: false,
    paths: [],
  };

  for (const arg of argv) {
    if (arg === '--staged') {
      options.staged = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: check-clms [--staged] [paths...]

Checks beefyCowVaults.json configs against on-chain contracts.

Options:
  --staged   Only check CLM files staged in git
  -h, --help Show this message`);
      process.exit(0);
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option '${arg}'`);
    } else {
      options.paths.push(arg);
    }
  }

  if (options.staged && options.paths.length > 0) {
    throw new Error('Use either --staged or explicit file paths, not both');
  }

  return options;
}

async function resolveFiles(options: Options): Promise<string[]> {
  if (options.staged) {
    return toClmFiles(gitFiles(['diff', '--name-only', '--cached', '--diff-filter=ACMR']));
  }

  if (options.paths.length > 0) {
    return toClmFiles(options.paths);
  }

  return fg([CLM_GLOB], { cwd: ROOT, onlyFiles: true });
}

function gitFiles(args: string[]): string[] {
  const stdout = execFileSync('git', [...args, '-z', '--', 'src/data'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout.split('\0').filter(Boolean);
}

function toClmFiles(files: string[]): string[] {
  return [...new Set(files.flatMap(file => toClmFile(file) ?? []))].sort();
}

function toClmFile(file: string): string | undefined {
  const relative = path.relative(ROOT, path.resolve(file)).split(path.sep).join('/');
  return relative.match(/^src\/data\/[^/]+\/beefyCowVaults\.json$/) ? relative : undefined;
}

async function checkFile(
  path: string
): Promise<{ apiChain: ApiChain; errors: Array<{ oracleId: string; error: string }> }> {
  const apiChain = extractChainIdFromPath(path);
  const chainId = ChainId[apiChain];
  const localData = validateCowClms(await loadJson<JsonCowClm[]>(path));
  const client = getRPCClient(chainId);
  const data = await mapWithConcurrency(localData, CLM_CONCURRENCY, async local => {
    const [clm, pool, vault] = await Promise.all([
      getBaseData(local, client, apiChain),
      isCowClmWithRewardPool(local) ? getRewardPoolData(local, client) : resolveUndefined,
      isCowClmWithVault(local) ? getVaultData(local, client) : resolveUndefined,
    ]);
    return { local, clm, pool, vault };
  });

  const errors = data
    .map(({ local, clm, pool, vault }) => {
      const error: Array<{ oracleId: string; error: string }> = [];

      if (local.lpAddress !== clm.lpAddress) {
        if (local.lpAddress.toLowerCase() === clm.lpAddress.toLowerCase()) {
          error.push({
            oracleId: local.oracleId,
            error: `CHECKSUM! lpAddress address mismatch: config "${local.lpAddress}" !== contract "${clm.lpAddress}"`,
          });
        } else {
          error.push({
            oracleId: local.oracleId,
            error: `lpAddress address mismatch: config "${local.lpAddress}" !== contract "${clm.lpAddress}"`,
          });
        }
      }
      if (local.tokens.length !== clm.tokens.length) {
        error.push({
          oracleId: local.oracleId,
          error: `tokens length mismatch: config "${local.tokens.length}" !== contract "${clm.tokens.length}"`,
        });
      }
      if (!local.tokens.every((token, i) => token === clm.tokens[i])) {
        if (local.tokens.every((token, i) => token.toLowerCase() === clm.tokens[i].toLowerCase())) {
          error.push({
            oracleId: local.oracleId,
            error: `CHECKSUM! tokens mismatch: config "${local.tokens.join(
              ', '
            )}" !== contract "${clm.tokens.join(', ')}"`,
          });
        } else {
          error.push({
            oracleId: local.oracleId,
            error: `tokens mismatch: config "${local.tokens.join(', ')}" !== contract "${clm.tokens.join(', ')}"`,
          });
        }
      }
      if (local.decimals.length !== clm.decimals.length) {
        error.push({
          oracleId: local.oracleId,
          error: `decimals length mismatch: config "${local.decimals.length}" !== contract "${clm.decimals.length}"`,
        });
      }
      if (!local.decimals.every((decimals, i) => decimals === clm.decimals[i])) {
        error.push({
          oracleId: local.oracleId,
          error: `decimals mismatch: config "${local.decimals.join(', ')}" !== contract "${clm.decimals.join(', ')}"`,
        });
      }
      if (local.tokenOracleIds.length !== clm.tokenOracleIds.length) {
        error.push({
          oracleId: local.oracleId,
          error: `tokenOracleIds length mismatch: config "${local.tokenOracleIds.length}" !== contract "${clm.tokenOracleIds.length}"`,
        });
      }
      if (
        !local.tokenOracleIds.every(
          (oracleId, i) => oracleId === clm.tokenOracleIds[i] || `W${oracleId}` === clm.tokenOracleIds[i]
        )
      ) {
        error.push({
          oracleId: local.oracleId,
          error: `tokenOracleIds mismatch: config "${local.tokenOracleIds.join(
            ', '
          )}" !== address book "${clm.tokenOracleIds.join(', ')}"`,
        });
      }

      if (isCowClmWithRewardPool(local) && pool) {
        if (local.address !== pool.stakedToken) {
          if (local.address.toLowerCase() === pool.stakedToken.toLowerCase()) {
            error.push({
              oracleId: local.oracleId,
              error: `CHECKSUM! rewardPool stakedToken mismatch: config "${local.address}" !== contract "${pool.stakedToken}"`,
            });
          } else {
            error.push({
              oracleId: local.oracleId,
              error: `WRONG POOL ADDRESS? rewardPool stakedToken mismatch: config "${local.address}" !== contract "${pool.stakedToken}"`,
            });
          }
        }
      }

      if (isCowClmWithVault(local) && vault) {
        if (local.address !== vault.want) {
          if (local.address.toLowerCase() === vault.want.toLowerCase()) {
            error.push({
              oracleId: local.oracleId,
              error: `CHECKSUM! vault want mismatch: config "${local.address}" !== contract "${vault.want}"`,
            });
          } else {
            error.push({
              oracleId: local.oracleId,
              error: `WRONG VAULT ADDRESS? vault want mismatch: config "${local.address}" !== contract "${vault.want}"`,
            });
          }
        }
      }

      return error;
    })
    .filter(e => e.length > 0);

  return { apiChain, errors: errors.flat() };
}

const clmAbi = parseAbi([
  'function want() external view returns (address)',
  'function wants() external view returns (address, address)',
]);

const erc20Abi = parseAbi(['function decimals() external view returns (uint8)']);

async function getBaseData(clm: AnyCowClm, client: Client, apiChain: ApiChain) {
  const [lpAddress, tokens] = await Promise.all([
    readContractWithRetry(`${apiChain}:${clm.oracleId}:want`, () =>
      readContract(client, {
        address: clm.address,
        abi: clmAbi,
        functionName: 'want',
      })
    ),
    readContractWithRetry(`${apiChain}:${clm.oracleId}:wants`, () =>
      readContract(client, {
        address: clm.address,
        abi: clmAbi,
        functionName: 'wants',
      })
    ),
  ]);
  const decimals = await Promise.all(
    tokens.map(token =>
      readContractWithRetry(`${apiChain}:${clm.oracleId}:${token}:decimals`, () =>
        readContract(client, {
          address: token,
          abi: erc20Abi,
          functionName: 'decimals',
        })
      )
    )
  );
  const tokenOracleIds = tokens.map(address => addressBook[apiChain].tokenAddressMap[address].oracleId);
  return {
    lpAddress,
    tokens,
    decimals,
    tokenOracleIds,
  };
}

const clmPoolAbi = parseAbi(['function stakedToken() external view returns (address)']);

async function getRewardPoolData(clm: CowClmWithRewardPool, client: Client) {
  const stakedToken = await readContractWithRetry(`${clm.oracleId}:rewardPool:stakedToken`, () =>
    readContract(client, {
      address: clm.rewardPool.address,
      abi: clmPoolAbi,
      functionName: 'stakedToken',
    })
  );

  return { stakedToken };
}

const clmVaultAbi = parseAbi(['function want() external view returns (address)']);

async function getVaultData(clm: CowClmWithVault, client: Client) {
  const want = await readContractWithRetry(`${clm.oracleId}:vault:want`, () =>
    readContract(client, {
      address: clm.vault.address,
      abi: clmVaultAbi,
      functionName: 'want',
    })
  );

  return { want };
}

const folderToChainId: Record<string, ApiChain> = {
  matic: 'polygon',
};

function extractChainIdFromPath(path: string): ApiChain {
  const matches = path.match(/\/([^\/]+)\/beefyCowVaults\.json$/);
  const folder = matches?.[1];
  if (!folder) {
    throw new Error(`Could not extract chain id from path: ${path}`);
  }
  const maybeChain = folderToChainId[folder] || folder;
  if (isApiChain(maybeChain)) {
    return maybeChain;
  }
  throw new Error(`Invalid chain id from path: ${maybeChain}`);
}

async function loadJson<ReturnType = unknown>(path: string): Promise<ReturnType> {
  const json = await fsPromises.readFile(path, 'utf-8');
  return JSON.parse(json);
}

async function readContractWithRetry<T>(label: string, call: () => Promise<T>): Promise<T> {
  return retryPromiseWithBackOff(
    () => withTimeout(call(), RPC_TIMEOUT_MS, label),
    undefined,
    label,
    1,
    RPC_RETRY_DELAY_MS,
    RPC_RETRY_LIMIT
  );
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

start()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
