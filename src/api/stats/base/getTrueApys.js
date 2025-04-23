const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const truePools = require('../../../data/base/trueLpPools.json');

const singlePool = {
  name: 'true-true',
  address: '0x21CFCFc3d8F98fC728f48341D10Ad8283F6EB7AB',
  gauge: '0x1a40621C54330940B081F925aA027458a4c035eD',
  oracle: 'tokens',
  oracleId: 'TRUE',
  decimals: '1e18',
};

const pools = [...truePools, singlePool];

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
