const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/arbitrum/stargateArbPools.json');
const poolsV2 = require('../../../data/arbitrum/stargateV2ArbPools.json');

const getStargateArbApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x9774558534036Ff2E236331546691b4eB70594b1',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools: poolsV1,
    oracleId: 'ARB',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x3da4f8E456AC648c489c286B99Ca37B666be7C4C',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateArbApys;
