const { getMasterChefApys } = require('../common/getMasterChefApys');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/matic/stargatePolygonPools.json');

const getStargatePolygonApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargatePolygonApys;
