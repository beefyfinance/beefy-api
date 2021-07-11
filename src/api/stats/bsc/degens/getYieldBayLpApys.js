const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/MasterChef.json');
const pools = require('../../../../data/degens/yieldBayLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getYieldBayLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0xf1530E2826920847Ba3Eaf9f60101Bf557332E67',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'palm-palm',
        poolId: 0,
        token: '0x9768E5b2d8e761905BC81Dfc554f9437A46CdCC6', //palm
      },
    ],
    oracleId: 'PALM',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getYieldBayLpApys;
