const { bscWeb3: web3 } = require('../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../constants');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const stablePools = require('../../../data/degens/thenaStableLpPools.json');
const volatilePools = require('../../../data/degens/thenaLpPools.json');
const gammaPools = require('../../../data/degens/thenaGammaPools.json');

const pools = [...stablePools, ...volatilePools, ...gammaPools];
const getThenaApys = async () => {
  return getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'THE',
    oracle: 'tokens',
    decimals: '1e18', // token is 1e18 but gauge.rewardRate returns 1e36
    // log: true,
  });
};

module.exports = getThenaApys;
