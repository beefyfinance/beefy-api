const {
  addressBook: {
    bsc: {
      tokens: { BUSD, STEEL },
      platforms: { ironfinance },
    },
  },
} = require('blockchain-addressbook');
const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/IronMasterChef.json');

const getIronSingleApys = async () => {
  const dnd = getMasterChefApys({
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

  const steel = getMasterChefApys({
    masterchef: ironfinance.steelchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: true,
    pools: [],
    singlePools: [
      {
        name: 'iron-steel',
        poolId: 0,
        token: STEEL.address,
        oracleId: STEEL.symbol,
        decimals: '1e' + STEEL.decimals.toString(),
      },
    ],
    oracleId: BUSD.symbol,
    oracle: 'tokens',
    decimals: '1e' + BUSD.decimals.toString(),
    // log: true,
  });

  let apys = {};
  const values = await Promise.all([dnd, steel]);
  for (const item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

module.exports = getIronSingleApys;
