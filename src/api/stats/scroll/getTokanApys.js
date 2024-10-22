const { SCROLL_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/scroll/tokanStablePools.json');
const volatilePools = require('../../../data/scroll/tokanVolatilePools.json');

const pools = [...stablePools, ...volatilePools];
export const getTokanApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'TKN',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0x1a2fCB585b327fAdec91f55D45829472B15f17a4',
    singleReward: true,
    // log: true,
  });
};
