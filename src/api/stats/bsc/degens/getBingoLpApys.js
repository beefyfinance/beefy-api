const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/BingoMasterChef.json');
const pools = require('../../../../data/degens/bingoLpPools.json');

const getBingoLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x97bdB4071396B7f60b65E0EB62CE212a699F4B08',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'sharePerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'sBGO',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getBingoLpApys;
