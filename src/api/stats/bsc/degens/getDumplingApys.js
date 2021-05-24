const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/DumplingMasterChef.json');
const pools = require('../../../../data/degens/dumplingLpPools.json');

const getDumplingApys = async () =>
  await getMasterChefApys({
    masterchef: '0xe2e643B051ABCFBE735b99eE00b2dbFd3a7BD798',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'dumplingPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'SDUMP',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getDumplingApys;
