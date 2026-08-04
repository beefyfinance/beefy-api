import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import GearboxVault from '../../../../abis/GearboxVault.ts';
import { fetchContract } from '../../../rpc/client.ts';
import { getApyBreakdown } from '../getApyBreakdownNew.ts';
import { getMerklApys } from '../getMerklApys.ts';

export type GearboxApyPool = {
  name: string;
  address: string;
};

export const getGearboxApys = async (chainId: ChainId, pools: GearboxApyPool[]) => {
  const [supplyApys, merklApys] = await Promise.all([getPoolsApys(chainId, pools), getMerklApys(chainId, pools)]);

  return getApyBreakdown(
    pools.map(p => ({
      vaultId: p.name,
      lending: supplyApys[pools.indexOf(p)],
      vault: merklApys[pools.indexOf(p)],
    }))
  );
};

const getPoolsApys = async (chainId: ChainId, pools: GearboxApyPool[]) => {
  const supplyRateCalls: Promise<bigint>[] = [];
  for (const pool of pools) {
    supplyRateCalls.push(fetchContract(pool.address, GearboxVault, chainId).read.supplyRate());
  }
  const [supplyRates] = await Promise.all([Promise.all(supplyRateCalls)]);

  return supplyRates.map(v => new BigNumber(v.toString()).div(1e27));
};
