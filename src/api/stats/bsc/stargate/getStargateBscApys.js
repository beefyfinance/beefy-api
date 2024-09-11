const { getStargateV2Apys } = require('../../common/stargate/getStargateV2Apys');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');

const poolsV2 = require('../../../../data/bsc/stargateV2BscPools.json');

const getStargateBscApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x26727C78B0209d9E787b2f9ac8f0238B122a3098',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateBscApys;
