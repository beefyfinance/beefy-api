const { getMasterChefApys } = require('../../common/getMasterChefApys');
const { getStargateV2Apys } = require('../../common/stargate/getStargateV2Apys');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');

const poolsV1 = require('../../../../data/bsc/stargateBscPools.json');
const poolsV2 = require('../../../../data/bsc/stargateV2BscPools.json');

const getStargateBscApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools: poolsV1,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x26727C78B0209d9E787b2f9ac8f0238B122a3098',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateBscApys;
