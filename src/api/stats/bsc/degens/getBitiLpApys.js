const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/BitiMasterChef.json');
const pools = require('../../../../data/degens/bitiLpPools.json');

const getBitiLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x2Dc2d579e0e0EA9Ab2EF5CcA4e813Ca7769148cB',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'bitiPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'BITI',
    oracle: 'tokens',
    decimals: '1e18',
    log: false,
  });

module.exports = getBitiLpApys;
