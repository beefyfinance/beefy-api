const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunchV2.json');
const pools = require('../../../data/avax/kyberLpPools.json');

const getKyberAvaxApys = async () => {
  return getKyberLpV2Apys({
    masterchef: '0xF2D574807624bdAd750436AfA940563c5fa34726',
    web3: web3,
    chainId: chainId,
    pools: pools,
    abi: ABI,
    v2: true,
    kncIndex: 0,
    reward: 'AVAX',
    rewardIndex: '1',
    kncIndex: '0',
    // log: true,
  });
};

module.exports = getKyberAvaxApys;
