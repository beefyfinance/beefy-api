const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { KAVA_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/kava/stargateV2KavaPools.json');

const getStargateKavaApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x10e28bA4D7fc9cf39F34E20bbC5C58694b2f1A92',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateKavaApys;
