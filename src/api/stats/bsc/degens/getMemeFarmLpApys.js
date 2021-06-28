const getMasterChefApys = require('./getBscMasterChefApys');

const MasterChef = require('../../../../abis/degens/MemeFarmMasterChef.json');
const pools = require('../../../../data/degens/memeFarmLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getMemeFarmApys = async () => {
  const lp = getMasterChefApys({
    masterchef: '0xa0A4Ab8c15c5b7C9f0d73a23786B5B51BA2d5399',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'MfrmPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'MFRM',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.0017,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [lp];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getMemeFarmApys error', result.reason);
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

module.exports = getMemeFarmApys;
