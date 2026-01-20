import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdownNew';
import { fetchContract } from '../../../rpc/client';
import GearboxVault from '../../../../abis/GearboxVault';
import { getMerklApys } from '../getMerklApys';

export const getGearboxApys = async (chainId, pools) => {
  const [supplyApys, merklApys] = await Promise.all([
    getPoolsApys(chainId, pools),
    getMerklApys(chainId, pools),
  ]);

  return getApyBreakdown(
    pools.map(p => ({
      vaultId: p.name,
      trading: supplyApys[pools.indexOf(p)],
      vault: merklApys[pools.indexOf(p)],
    }))
  );
};

const getPoolsApys = async (chainId, pools) => {
  const supplyRateCalls = [];
  for (const pool of pools) {
    supplyRateCalls.push(fetchContract(pool.address, GearboxVault, chainId).read.supplyRate());
  }
  const [supplyRates] = await Promise.all([Promise.all(supplyRateCalls)]);

  return supplyRates.map(v => new BigNumber(v.toString()).div(1e27).times(0.905));
};
