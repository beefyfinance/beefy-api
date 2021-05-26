const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/IronMasterChef.json');
const pools = require('../../../data/matic/ironLpPools.json');
const { sushiClient } = require('../../../apollo/client');

const getIronApys = async () => {
  const lps = await getMasterChefApys({
    masterchef: '0x65430393358e55A658BcdE6FF69AB28cF1CbB77a',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracle: 'tokens',
    oracleId: 'TITAN',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: 0.003,
  });

  const single = await getMasterChefApys({
    masterchef: '0x08b5249F1fee6e4fCf8A7113943ed6796737386E',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'iron-titan',
        poolId: 0,
        address: '0xaaa5b9e6c589642f98a1cda99b9d024b8407285a',
        oracle: 'tokens',
        oracleId: 'TITAN',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'TITAN',
    decimals: '1e18',
    // log: true,
  });

  return { ...lps, ...single };
};

module.exports = getIronApys;
