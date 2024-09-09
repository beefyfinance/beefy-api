const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { SEI_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/sei/stargateV2SeiPools.json');

const getStargateSeiApys = async () => {
  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x8c1014B5936dD88BAA5F4DB0423C3003615E03a0',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV2.apys };
  const apyBreakdowns = { ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateSeiApys;
