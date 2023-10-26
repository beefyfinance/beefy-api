const { getMasterChefApys } = require('../common/getMasterChefApys');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/arbitrum/stargateArbPools.json');

const getStargateArbApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x9774558534036Ff2E236331546691b4eB70594b1',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools,
    oracleId: 'ARB',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateArbApys;
