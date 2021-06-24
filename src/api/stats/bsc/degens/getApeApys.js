const getMasterChefApys = require('./getBscMasterChefApys');

const MasterChef = require('../../../../abis/MasterChef.json');
const pools = require('../../../../data/degens/apeLpPools.json');
const { apeClient } = require('../../../../apollo/client');

const getApeApys = async () => {
  const lp = getMasterChefApys({
    masterchef: '0x5c8d727b265dbafaba67e050f2f739caeeb4a6f9',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'BANANA',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: 0.0015,
  });

  const banana = getMasterChefApys({
    masterchef: '0x5c8d727b265dbafaba67e050f2f739caeeb4a6f9',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    singlePools: [
      {
        name: 'banana-banana',
        poolId: 0,
        address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
        oracle: 'tokens',
        oracleId: 'BANANA',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'BANANA',
    decimals: '1e18',
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [lp, banana];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getApeApys error', result.reason);
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

module.exports = getApeApys;
