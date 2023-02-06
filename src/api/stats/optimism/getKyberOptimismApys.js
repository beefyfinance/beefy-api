const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunchV2.json');
const pools = require('../../../data/optimism/kyberLpPools.json');

const getKyberOptimismApys = async () => {
  return getKyberLpV2Apys({
    masterchef: '0x715Cc6C0d591CA3FA8EA6e4Cb445adA0DC79069A',
    web3: web3,
    chainId: chainId,
    pools: pools,
    abi: ABI,
    v2: true,
    reward: 'OP',
    rewardIndex: '0',
    kncIndex: '1',
    // log: true,
  });
};

module.exports = getKyberOptimismApys;
