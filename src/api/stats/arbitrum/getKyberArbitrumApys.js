const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunch.json');
const pools = require('../../../data/arbitrum/kyberLpPools.json');

const getKyberArbitrumApys = async () => {
  return getKyberLpV2Apys({
    masterchef: '0xE8144386BF00f168ed7a0E0D821AC18e02a461BA',
    web3: web3,
    chainId: chainId,
    pools: pools,
    abi: ABI,
    // log: true,
  });
};

module.exports = getKyberArbitrumApys;
