const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/GoalMasterChef.json');
const pools = require('../../../../data/degens/goalLpPools.json');

const getGoalLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x23A88eDd92559d18A36B3B1B3DD957AF6459465e',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'goalPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'GOAL',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getGoalLpApys;
