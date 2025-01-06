const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/base/stargateV2BasePools.json');

const getStargateBaseApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0xDFc47DCeF7e8f9Ab19a1b8Af3eeCF000C7ea0B80',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateBaseApys;
