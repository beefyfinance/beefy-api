const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const trueLpPools = require('../../../data/base/trueLpPools.json');
const truePools = require('../../../data/base/truePools.json');

const pools = [...trueLpPools, ...truePools];

const getTrueApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'TRUE',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};

module.exports = { getTrueApys };
