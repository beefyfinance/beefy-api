import BigNumber from 'bignumber.js';
import { getFarmApys } from '../common/getSolidlyGaugeApys';
import { getApyBreakdown } from '../common/getApyBreakdownNew';

const { SONIC_CHAIN_ID: chainId } = require('../../../constants');
const ichiPools = require('../../../data/sonic/swapxIchiPools.json');

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
