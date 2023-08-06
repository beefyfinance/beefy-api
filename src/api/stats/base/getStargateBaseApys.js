const { getMasterChefApys } = require('../common/getMasterChefApys');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/base/stargateBasePools.json');

const getStargateBaseApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x06Eb48763f117c7Be887296CDcdfad2E4092739C',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateBaseApys;
