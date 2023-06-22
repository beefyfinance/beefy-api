const { getMasterChefApys } = require('../common/getMasterChefApys');
const { METIS_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/metis/stargateMetisPools.json');

const getStargateApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools,
    oracleId: 'METIS',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateApys;
