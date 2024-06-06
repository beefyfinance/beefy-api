const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { KAVA_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/kava/stargateKavaPools.json');
const poolsV2 = require('../../../data/kava/stargateV2KavaPools.json');

const getStargateKavaApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x35F78Adf283Fe87732AbC9747d9f6630dF33276C',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools: poolsV1,
    oracleId: 'KAVA',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x10e28bA4D7fc9cf39F34E20bbC5C58694b2f1A92',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateKavaApys;
