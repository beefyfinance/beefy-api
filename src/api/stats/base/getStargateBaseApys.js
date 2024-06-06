const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/base/stargateBasePools.json');
const poolsV2 = require('../../../data/base/stargateV2BasePools.json');

const getStargateBaseApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x06Eb48763f117c7Be887296CDcdfad2E4092739C',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools: poolsV1,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0xDFc47DCeF7e8f9Ab19a1b8Af3eeCF000C7ea0B80',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateBaseApys;
