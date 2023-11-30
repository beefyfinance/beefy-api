const { getMasterChefApys } = require('../common/getMasterChefApys');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/fantom/stargateFantomPools.json');
const getBlockTime = require('../../../utils/getBlockTime');

const getStargateFantomApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    tokenPerBlock: 'stargatePerBlock',
    secondsPerBlock: getBlockTime(chainId),
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateFantomApys;
