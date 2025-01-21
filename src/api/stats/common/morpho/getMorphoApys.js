import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../getApyBreakdownNew';

export const getMorphoApys = async (chainId, pools) => {
  const vaults = pools.map(p => p.address);
  const body = {
    query: `{
    vaults(where: { chainId_in: [${chainId}], address_in: ${JSON.stringify(vaults)} }) {
      items {
        name
        address
        state {
          netApy
          netApyWithoutRewards
        }
      }
    }}`,
  };
  let apys = [];
  try {
    const res = await fetch('https://blue-api.morpho.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => r.json());
    apys = res.data.vaults.items;
  } catch (err) {
    console.error('Morpho apy error', chainId, err.message);
  }

  return getApyBreakdown(
    pools.map(p => {
      const apy = apys.find(item => item.address === p.address);
      const trading = new BigNumber(apy?.state?.netApyWithoutRewards || 0);
      return {
        vaultId: p.name,
        vault: new BigNumber(apy?.state?.netApy || 0).minus(trading),
        trading,
      };
    })
  );
};
