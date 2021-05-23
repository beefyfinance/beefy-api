const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/ZefiMasterChef.json');
const pools = require('../../../../data/degens/zefiLpPoolsV2.json');

const getZefiLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x05a8ba2DEf87f8AdaF223Edcd04F7Fc82eA6aee8',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'zefiPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'ZEFI',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getZefiLpApys;
