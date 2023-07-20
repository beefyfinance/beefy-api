const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunchV2.json');
const pools = require('../../../data/optimism/kyberLpPools.json');

const getKyberOptimismApys = async () => {
  return getKyberLpV2Apys({
    chainId: chainId,
    pools: pools,
    abi: ABI,
    // log: true,
  });
};

module.exports = getKyberOptimismApys;
