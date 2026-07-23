import { BigNumber } from 'bignumber.js';
import { SONIC_CHAIN_ID as chainId } from '../../../constants.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import { getFarmApys } from '../common/getSolidlyGaugeApys.js';
import ichiPools from '../../../data/sonic/swapxIchiPools.json' with { type: 'json' };

const pools = [...ichiPools];

export const getSwapxApys = async () => {
  const [farmApys, gemsxApys] = await Promise.all([
    getFarmApys({
      chainId: chainId,
      pools: pools,
      oracleId: 'SWPx',
      oracle: 'tokens',
      decimals: '1e18',
      boosted: false,
      singleReward: true,
      // log: true,
    }),
    getGemsxApy(pools),
  ]);
  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: farmApys[i].plus(gemsxApys[i]) })));
};

async function getGemsxApy(pools) {
  return pools.map(_ => new BigNumber(0));
}
