const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/IronChef.json');
const pools = require('../../../data/matic/ironSwapPools.json');

const getIronSwapApys = async () => {
  return getMasterChefApys({
    masterchef: '0x1fD1259Fa8CdC60c6E8C86cfA592CA1b8403DFaD',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerSecond',
    secondsPerBlock: 1,
    allocPointIndex: '2',
    hasMultiplier: false,
    pools: pools,
    oracle: 'tokens',
    oracleId: 'ICEiron',
    decimals: '1e18',
    // log: true,
  });
};

module.exports = getIronSwapApys;
