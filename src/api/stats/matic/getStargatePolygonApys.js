const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/matic/stargateV2PolygonPools.json');

const getStargatePolygonApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x4694900bDbA99Edf07A2E46C4093f88F9106a90D',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargatePolygonApys;
