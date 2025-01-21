const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/optimism/stargateV2OpPools.json');

const getStargateOpApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0xFBb5A71025BEf1A8166C9BCb904a120AA17d6443',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateOpApys;
