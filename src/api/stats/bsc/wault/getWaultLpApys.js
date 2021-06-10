const getMasterChefApys = require('../degens/getMasterChefApys');
const MasterChef = require('../../../../abis/WaltMaster.json');
const pools = require('../../../../data/waultLpPools.json');

const getWaultLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x22fB2663C7ca71Adc2cc99481C77Aaf21E152e2D',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'wexPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'WEX',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getWaultLpApys;
