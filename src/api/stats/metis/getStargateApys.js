const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { METIS_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/metis/stargateV2MetisPools.json');

const getStargateApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0xF1fCb4CBd57B67d683972A59B6a7b1e2E8Bf27E6',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateApys;
