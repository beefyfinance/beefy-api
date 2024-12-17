const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/arbitrum/stargateV2ArbPools.json');

const getStargateArbApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x3da4f8E456AC648c489c286B99Ca37B666be7C4C',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateArbApys;
