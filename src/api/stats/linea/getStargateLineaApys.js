const { getMasterChefApys } = require('../common/getMasterChefApys');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/linea/stargateLineaPools.json');

const getStargateLineaApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateLineaApys;
