const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/IronMasterChef.json');
const pools = require('../../../../data/degens/ironDndLpPools.json');

const getIronDndApys = async () =>
  await getMasterChefApys({
    masterchef: '0xAA8b49a4FC0A4C94087B2A01AaC760D89D491432',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'DND',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getIronDndApys;
