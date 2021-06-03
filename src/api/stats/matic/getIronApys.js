const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/IronMasterChef.json');
const pools = require('../../../data/matic/ironLpPools.json');
const quickPools = require('../../../data/matic/ironQuickLpPools.json');
const ironTitanPools = require('../../../data/matic/ironTitanLpPools.json');
const { sushiClient, quickClient } = require('../../../apollo/client');

const getIronApys = async () => {
  const lps = getMasterChefApys({
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

  const quickLPs = getMasterChefApys({
    masterchef: '0x65430393358e55A658BcdE6FF69AB28cF1CbB77a',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: quickPools,
    oracle: 'tokens',
    oracleId: 'TITAN',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.003,
  });

  const ironTitan = getMasterChefApys({
    masterchef: '0xb444d596273C66Ac269C33c30Fbb245F4ba8A79d',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: ironTitanPools,
    oracle: 'tokens',
    oracleId: 'TITAN',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: 0.003,
  });

  const single = getMasterChefApys({
    masterchef: '0xa37DD1f62661EB18c338f18Cf797cff8b5102d8e',
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
    oracleId: 'USDC',
    decimals: '1e18',
    // log: true,
  });

  let apys = {};
  const values = await Promise.all([lps, quickLPs, ironTitan, single]);
  for (const item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

module.exports = getIronApys;
