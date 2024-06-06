const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/linea/stargateLineaPools.json');
const poolsV2 = require('../../../data/linea/stargateV2LineaPools.json');

const getStargateLineaApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    pools: poolsV1,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0x25BBf59ef9246Dc65bFac8385D55C5e524A7B9eA',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateLineaApys;
