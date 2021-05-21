const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/IronMasterChef.json');

const getIronSingleDndApys = async () =>
  await getMasterChefApys({
    masterchef: '0x5d8b018BF2058Cd5264AA8c97A29E23cE660B3Ea',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: true,
    pools: [],
    singlePools: [
      {
        name: 'iron-dnd',
        poolId: 0,
        token: '0x34EA3F7162E6f6Ed16bD171267eC180fD5c848da',
      },
    ],
    oracleId: 'DND',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getIronSingleDndApys;
