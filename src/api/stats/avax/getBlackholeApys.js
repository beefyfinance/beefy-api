const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const stablePools = require('../../../data/avax/blackStableLpPools.json');
const volatilePools = require('../../../data/avax/blackLpPools.json');

const pools = [...stablePools, ...volatilePools];
export const getBlackholeApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'BLACK',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
