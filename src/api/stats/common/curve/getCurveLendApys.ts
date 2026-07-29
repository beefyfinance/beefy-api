import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import type { BigNumberish } from '../../../../utils/big-number.ts';
import { type CurveLendPool, getCurveLendSupplyApys } from './getCurveLendSupplyApys.ts';

// Curve-lend vaults: supply APY -> lending (fee charged, not autocompounded);
// gauge/convex rewards -> vault (autocompounded).
export const getCurveLendApyRequests = async (
  chainId: ChainId,
  lendPools: CurveLendPool[],
  farmAprByName: Record<string, BigNumberish>,
  providerFee: number
) => {
  const lendApys = await getCurveLendSupplyApys(chainId, lendPools);
  return lendPools.map(pool => ({
    vaultId: pool.name,
    lending: lendApys[pool.name],
    vault: farmAprByName[pool.name],
    providerFee,
  }));
};
