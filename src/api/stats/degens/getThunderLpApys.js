const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/ThunderMasterChef.json');
const pools = require('../../../data/degens/thunderLpPools.json');

const getThunderLpApys = async () => {
  const masterchef = '0xa7bfBEFbE923dcF6EEfF355c22520395670b684E';
  const tokenPerBlock = 'thunderPerBlock';
  const oracleId = 'TNDR';
  const oracle = 'tokens';
  const decimals = '1e18';

  return await getMasterChefApys(masterchef, MasterChefAbi, tokenPerBlock, pools, oracle, oracleId, decimals);
};

module.exports = getThunderLpApys;
