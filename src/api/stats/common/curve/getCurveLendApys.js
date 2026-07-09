import { getCurveLendSupplyApys } from './getCurveLendSupplyApys';

// Curve-lend vaults: supply APY -> lending (fee charged, not autocompounded);
// gauge/convex rewards -> vault (autocompounded).
export const getCurveLendApyRequests = async (chainId, lendPools, farmAprByName, providerFee) => {
  const lendApys = await getCurveLendSupplyApys(chainId, lendPools);
  return lendPools.map(pool => ({
    vaultId: pool.name,
    lending: lendApys[pool.name],
    vault: farmAprByName[pool.name],
    providerFee,
  }));
};
