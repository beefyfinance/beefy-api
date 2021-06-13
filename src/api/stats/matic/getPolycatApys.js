const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/matic/PolycatMasterChef.json');
const sushiPools = require('../../../data/matic/polycatSushiLpPool.json');
const quickPools = require('../../../data/matic/polycatQuickLpPool.json');
const { sushiClient, quickClient } = require('../../../apollo/client');

const getPolycatApys = async () => {
  const sushi = getMasterChefApys({
    masterchef: '0x8CFD1B9B7478E7B0422916B72d1DB6A9D513D734',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'fishPerBlock',
    hasMultiplier: false,
    pools: sushiPools,
    oracleId: 'FISH',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: 0.0025,
  });

  const single = getMasterChefApys({
    masterchef: '0x8CFD1B9B7478E7B0422916B72d1DB6A9D513D734',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'fishPerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'polycat-fish',
        poolId: 1,
        address: '0x3a3Df212b7AA91Aa0402B9035b098891d276572B',
        oracle: 'tokens',
        oracleId: 'FISH',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'FISH',
    decimals: '1e18',
    // log: true,
  });

  const quick = getMasterChefApys({
    masterchef: '0x8CFD1B9B7478E7B0422916B72d1DB6A9D513D734',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'fishPerBlock',
    hasMultiplier: false,
    pools: quickPools,
    oracleId: 'FISH',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.003,
  });

  let apys = {};
  const values = await Promise.all([sushi, quick, single]);
  for (const item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

module.exports = getPolycatApys;
