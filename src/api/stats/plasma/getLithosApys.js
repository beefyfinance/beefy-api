import { PLASMA_CHAIN_ID as chainId }from '../../../constants.ts';
import { getRewardPoolApys } from '../common/getRewardPoolApys.js';
import stablePools from '../../../data/plasma/lithosStablePools.json' with { type: "json" };
import volatilePools from '../../../data/plasma/lithosPools.json' with { type: "json" };

const pools = [...stablePools, ...volatilePools];
export const getLithosApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'LITH',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
