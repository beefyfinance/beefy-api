const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { MANTLE_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/mantle/stargateV2MantlePools.json');

const getStargateMantleApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x02DC1042E623A8677B002981164ccc05d25d486a',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateMantleApys;
