const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/ZefiMasterChef.json');
const pools = require('../../../data/degens/zefiLpPools.json');

const getZefiLpApys = async () => {
  const masterchef = '0x05a8ba2DEf87f8AdaF223Edcd04F7Fc82eA6aee8';
  const tokenPerBlock = 'zefiPerBlock';
  const oracleId = 'ZEFI';
  const oracle = 'tokens';
  const decimals = '1e18';

  return await getMasterChefApys(masterchef, MasterChefAbi, tokenPerBlock, pools, oracle, oracleId, decimals);
};

module.exports = getZefiLpApys;
