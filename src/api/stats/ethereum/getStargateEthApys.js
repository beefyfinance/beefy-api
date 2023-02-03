const { getMasterChefApys } = require('../common/getMasterChefApys');
const { ethereumWeb3: web3 } = require('../../../utils/web3');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/ethereum/stargateEthPools.json')

const getStargateEthApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18'
  });

module.exports = getStargateEthApys;
