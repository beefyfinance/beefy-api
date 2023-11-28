const { getMasterChefApys } = require('../common/getMasterChefApys');
const { KAVA_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/kava/stargateKavaPools.json');

const getStargateKavaApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x35F78Adf283Fe87732AbC9747d9f6630dF33276C',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools,
    oracleId: 'KAVA',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateKavaApys;
