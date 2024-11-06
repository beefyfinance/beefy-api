import { promises as fsPromises } from 'fs';
import fg from 'fast-glob';
import {
  AnyCowClm,
  CowClmWithRewardPool,
  CowClmWithVault,
  isCowClmWithRewardPool,
  isCowClmWithVault,
  JsonCowClm,
  validateCowClms,
} from '../src/api/cowcentrated/types';
import { ApiChain, isApiChain } from '../src/utils/chain';
import { getRPCClient } from '../src/api/rpc/client';
import { ChainId } from '../packages/address-book/src/types/chainid';
import { Client, parseAbi } from 'viem';
import { readContract } from 'viem/actions';
import { addressBook } from '../packages/address-book/src/address-book';
import { groupBy } from 'lodash';

/**
 * This script checks the beefyCowVaults.json configs against the on-chain contracts.
 * Will throw if the local validateCowClms fails; or if a RPC call fails.
 * Otherwise, will print out any mismatches between config and contract.
 */

async function start() {
  const clmFiles = await fg('./src/data/**/beefyCowVaults.json');

  const errorsPerFile = await Promise.all(clmFiles.map(checkFile));
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

async function checkFile(
  path: string
): Promise<{ apiChain: ApiChain; errors: Array<{ oracleId: string; error: string }> }> {
  const apiChain = extractChainIdFromPath(path);
  const chainId = ChainId[apiChain];
  const localData = validateCowClms(await loadJson<JsonCowClm[]>(path));
  const client = getRPCClient(chainId) as Client;
  const data = await Promise.all(
    localData.map(async local => {
      const [clm, pool, vault] = await Promise.all([
        getBaseData(local, client, apiChain),
        isCowClmWithRewardPool(local) ? getRewardPoolData(local, client) : resolveUndefined,
        isCowClmWithVault(local) ? getVaultData(local, client) : resolveUndefined,
      ]);
      return { local, clm, pool, vault };
    })
  );

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
            error: `tokens mismatch: config "${local.tokens.join(', ')}" !== contract "${clm.tokens.join(
              ', '
            )}"`,
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
          error: `decimals mismatch: config "${local.decimals.join(', ')}" !== contract "${clm.decimals.join(
            ', '
          )}"`,
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

      if (isCowClmWithRewardPool(local)) {
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

      if (isCowClmWithVault(local)) {
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
    readContract(client, {
      address: clm.address,
      abi: clmAbi,
      functionName: 'want',
    }),
    readContract(client, {
      address: clm.address,
      abi: clmAbi,
      functionName: 'wants',
    }),
  ]);
  const decimals = await Promise.all(
    tokens.map(token =>
      readContract(client, {
        address: token,
        abi: erc20Abi,
        functionName: 'decimals',
      })
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
  const stakedToken = await readContract(client, {
    address: clm.rewardPool.address,
    abi: clmPoolAbi,
    functionName: 'stakedToken',
  });

  return { stakedToken };
}

const clmVaultAbi = parseAbi(['function want() external view returns (address)']);

async function getVaultData(clm: CowClmWithVault, client: Client) {
  const want = await readContract(client, {
    address: clm.vault.address,
    abi: clmVaultAbi,
    functionName: 'want',
  });

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

start()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
