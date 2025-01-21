const { SONIC_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/sonic/swapxStableLpPools.json');
const ichiPools = require('../../../data/sonic/swapxIchiPools.json');

const pools = [...stablePools, ...ichiPools];

export const getSwapxApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'SWPx',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    singleReward: true,
    // log: true,
  });
};
