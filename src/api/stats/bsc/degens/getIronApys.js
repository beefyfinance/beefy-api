const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/IronMasterChef.json');
const pools = require('../../../../data/degens/ironLpPools.json');

const getIronApys = async () =>
  await getMasterChefApys({
    masterchef: '0xC5a992dD7ba108e3349D2Fd8e8E126753Ca8Ce34',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'STEEL',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getIronApys;
