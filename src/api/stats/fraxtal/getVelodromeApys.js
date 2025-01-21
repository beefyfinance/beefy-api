const { FRAXTAL_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/fraxtal/veloStablePools.json');
const volatilePools = require('../../../data/fraxtal/veloLpPools.json');

const pools = [...stablePools, ...volatilePools];

export const getVelodromeApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    singleReward: true,
    // log: true,
  });
};
