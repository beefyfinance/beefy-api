const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunchV2.json');
const pools = require('../../../data/avax/kyberLpPools.json');

const getKyberAvaxApys = async () => {
  return getKyberLpV2Apys({
    chainId: chainId,
    pools: pools,
    abi: ABI,
    // log: true,
  });
};

module.exports = getKyberAvaxApys;
