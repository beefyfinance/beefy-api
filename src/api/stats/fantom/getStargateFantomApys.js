const { getMasterChefApys } = require('../common/getMasterChefApys');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/fantom/stargateFantomPools.json')

const getStargateFantomApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18'
  });

module.exports = getStargateFantomApys;
