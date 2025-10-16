const { PLASMA_CHAIN_ID: chainId } = require('../../../constants');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const stablePools = require('../../../data/plasma/lithosStablePools.json');
const volatilePools = require('../../../data/plasma/lithosPools.json');

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
