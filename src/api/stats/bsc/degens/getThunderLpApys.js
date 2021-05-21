const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/ThunderMasterChef.json');
const pools = require('../../../../data/degens/thunderLpPools.json');

const getThunderLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0xa7bfBEFbE923dcF6EEfF355c22520395670b684E',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'thunderPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'TNDR',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getThunderLpApys;
