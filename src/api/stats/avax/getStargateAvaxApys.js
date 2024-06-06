const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/avax/stargateAvaxPools.json');
const poolsV2 = require('../../../data/avax/stargateV2AvaxPools.json');

const getStargateAvaxApys = async () => {
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
    masterchef: '0x8db623d439C8c4DFA1Ca94E4CD3eB8B3Aaff8331',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateAvaxApys;
