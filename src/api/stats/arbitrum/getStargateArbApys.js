const { getMasterChefApys } = require('../common/getMasterChefApys');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/arbitrum/stargateArbPools.json')

const getStargateArbApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0xeA8DfEE1898a7e0a59f7527F076106d7e44c2176',
    tokenPerBlock: 'stargatePerBlock',
    secondsPerBlock: 12.1,
    hasMultiplier: false,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18'
  });

module.exports = getStargateArbApys;
