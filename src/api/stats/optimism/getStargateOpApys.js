const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/optimism/stargateOpPools.json');
const poolsV2 = require('../../../data/optimism/stargateV2OpPools.json');

const getStargateOpApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x4DeA9e918c6289a52cd469cAC652727B7b412Cd2',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools: poolsV1,
    oracleId: 'OP',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0xFBb5A71025BEf1A8166C9BCb904a120AA17d6443',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateOpApys;
