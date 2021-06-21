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
  let apyBreakdowns = {};

  let promises = [sushi, quick, single];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getPolycatApys error', result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues = result.value;
    let mappedApyBreakdownValues = {};

    // Loop through key values and move default breakdown format
    // To require totalApy key
    for (const [key, value] of Object.entries(result.value)) {
      mappedApyBreakdownValues[key] = {
        totalApy: value,
      };
    }

    // Break out to apy and breakdowns if possible
    let hasApyBreakdowns = 'apyBreakdowns' in result.value;
    if (hasApyBreakdowns) {
      mappedApyValues = result.value.apys;
      mappedApyBreakdownValues = result.value.apyBreakdowns;
    }

    apys = { ...apys, ...mappedApyValues };

    apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
  }

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = getPolycatApys;
