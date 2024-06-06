const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { MANTLE_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/mantle/stargateMantlePools.json');
const poolsV2 = require('../../../data/mantle/stargateV2MantlePools.json');

const getStargateMantleApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x352d8275AAE3e0c2404d9f68f6cEE084B5bEB3DD',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools: poolsV1,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x02DC1042E623A8677B002981164ccc05d25d486a',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateMantleApys;
