const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/matic/stargatePolygonPools.json');
const poolsV2 = require('../../../data/matic/stargateV2PolygonPools.json');

const getStargatePolygonApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools: poolsV1,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x4694900bDbA99Edf07A2E46C4093f88F9106a90D',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargatePolygonApys;
