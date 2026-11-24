import { BaseError } from 'viem';
import type { ApiChain } from '../../../utils/chain.ts';
import { toChainId } from '../../../utils/chain.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getRPCClient } from '../../rpc/client.ts';
import type { CowVault } from '../../vaults/types.ts';
import { poolAbi, vaultAbi } from './abis.ts';
import { contractOf, FeeUnavailableError, type PoolBase } from './kind.ts';
import { kinds } from './kinds/index.ts';
import { CallFailedError, Reader } from './reader.ts';
import type { ClmSwapFee, ClmSwapFees } from './types.ts';

const logger = getLoggerFor({ module: 'clm', component: 'swap-fees' });

/** read a few blocks behind latest so every fallback rpc has the block */
const BLOCK_LAG = 5n;

type VaultResult = { vaultId: string; fee: ClmSwapFee } | { vaultId: string; error: unknown };

/** Fee of each vault's pool; a vault whose fee can't be read is left out, rejects only if the block can't be read */
export async function fetchChainSwapFees(chain: ApiChain, vaults: CowVault[]): Promise<ClmSwapFees> {
  const client = getRPCClient(toChainId(chain));
  const block = await client.getBlock({ blockNumber: (await client.getBlockNumber()) - BLOCK_LAG });
  const reader = new Reader(client, { number: block.number, timestamp: block.timestamp });

  const results = await Promise.all(
    vaults.map(
      (vault): Promise<VaultResult> =>
        vaultFee(vault, reader).then(
          fee => ({ vaultId: vault.id, fee }),
          error => ({ vaultId: vault.id, error })
        )
    )
  );

  const failed = results.flatMap(result => ('error' in result ? [result] : []));
  if (failed.length) {
    logger.warn(
      { chain, count: failed.length, vaults: failed.map(({ vaultId, error }) => ({ vaultId, reason: reason(error) })) },
      'could not read swap fee'
    );
  }
  return Object.fromEntries(results.flatMap(result => ('fee' in result ? [[result.vaultId, result.fee]] : [])));
}

async function vaultFee(vault: CowVault, reader: Reader): Promise<ClmSwapFee> {
  const pool = await resolvePool(vault, reader);
  const matches = await Promise.all(kinds.map(kind => kind.identify(pool, reader)));
  const owner = matches.find(match => match !== undefined);
  if (!owner) throw new FeeUnavailableError('no kind matched the pool');
  return owner.fee();
}

/** want() is the pool the strategy actually uses, the config tokenAddress is wrong for some old vaults */
async function resolvePool(vault: CowVault, reader: Reader): Promise<PoolBase> {
  const want = await reader.tryRead({ address: vault.earnContractAddress, abi: vaultAbi, functionName: 'want' });
  const address = contractOf(want) || vault.tokenAddress;
  if (!address) throw new FeeUnavailableError('vault has no pool');
  const factory = await reader.tryRead({ address, abi: poolAbi, functionName: 'factory' });
  return { address, factory: contractOf(factory) };
}

function reason(error: unknown): string {
  if (error instanceof FeeUnavailableError) return error.message;
  if (error instanceof CallFailedError) return `call failed: ${error.message}`;
  if (error instanceof BaseError) return `rpc failed: ${error.shortMessage}`;
  return String(error);
}
