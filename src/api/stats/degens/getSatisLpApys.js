const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/SatisMasterChef.json');
const pools = require('../../../data/degens/satisLpPools.json');

const getSatisLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x9b1dfEF15251AAF3540C1d008d4c4Aa6f636339d',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'satisfiPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'SAT',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getSatisLpApys;
