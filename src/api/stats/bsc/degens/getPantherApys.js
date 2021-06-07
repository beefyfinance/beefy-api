const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/PantherMasterChef.json');
const pools = require('../../../../data/degens/pantherLpPools.json');

const getPantherApys = async () =>
  await getMasterChefApys({
    masterchef: '0x058451C62B96c594aD984370eDA8B6FD7197bbd4',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'pantherPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'PANTHER',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getPantherApys;
