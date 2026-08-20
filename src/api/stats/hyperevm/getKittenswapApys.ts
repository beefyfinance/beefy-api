import { HYPEREVM_CHAIN_ID as chainId } from '../../../constants.ts';
import { getSolidlyGaugeApys, type SolidlyGaugePool } from '../common/getSolidlyGaugeApys.ts';
import volatilePools from '../../../data/hyperevm/kittenswapLpPools.json' with { type: 'json' };
import stablePools from '../../../data/hyperevm/kittenswapStablePools.json' with { type: 'json' };

const pools: SolidlyGaugePool[] = [...stablePools, ...volatilePools];

export const getKittenswapApys = async () => {
  return getSolidlyGaugeApys({
    chainId,
    pools: pools.filter(p => p.gauge),
    oracleId: 'KITTEN',
    oracle: 'tokens',
    decimals: '1e18',
    rewardScale: 1e18,
    boosted: false,
    kitten: true,
    // log: true,
  });
};
