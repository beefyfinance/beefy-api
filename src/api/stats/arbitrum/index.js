const { getCurveApys } = require('./getCurveApys');
const getBalancerArbApys = require('./getBalancerArbApys');
const getAuraArbitrumApys = require('./getAuraArbitrumApys');
const { getBeefyArbCowApys } = require('./getBeefyArbCowApys');
const { getMimApys } = require('./getMimApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const getApys = [
  getAuraArbitrumApys,
  getMimApys,
  getCurveApys,
  // getBalancerArbApys,
  getBeefyArbCowApys,
  () => getMorphoApys(chainId, require('../../../data/arbitrum/morphoPools.json')),
];

const getArbitrumApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getArbitrumApys error', result.reason);
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

  const end = Date.now();
  console.log(`> [APY] Arbitrum finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getArbitrumApys };
