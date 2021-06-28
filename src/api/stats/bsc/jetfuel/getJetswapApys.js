const getMasterChefApys = require('../degens/getBscMasterChefApys');

const MasterChefAbi = require('../../../../abis/MasterChef.json');
const pools = require('../../../../data/jetswapLpPools.json');
const { jetswapClient } = require('../../../../apollo/client');

const getJetswapApys = async () => {
  const lp = getMasterChefApys({
    masterchef: '0x63d6EC1cDef04464287e2af710FFef9780B6f9F5',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'WINGS',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: jetswapClient,
    liquidityProviderFee: 0.0025,
  });

  const single = getMasterChefApys({
    masterchef: '0x63d6EC1cDef04464287e2af710FFef9780B6f9F5',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    singlePools: [
      {
        name: 'jetswap-wings',
        poolId: 0,
        address: '0x0487b824c8261462F88940f97053E65bDb498446',
        oracle: 'tokens',
        oracleId: 'WINGS',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'WINGS',
    decimals: '1e18',
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [lp, single];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getJetswapApys error', result.reason);
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

module.exports = getJetswapApys;
