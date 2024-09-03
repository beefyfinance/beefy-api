const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/avax/stargateV2AvaxPools.json');

const getStargateAvaxApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x8db623d439C8c4DFA1Ca94E4CD3eB8B3Aaff8331',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateAvaxApys;
