const { getCurveApys } = require('./getCurveApys');
const getBalancerArbApys = require('./getBalancerArbApys');
const { getGmxV2Apys } = require('./getGmxV2Apys');
const { getGmxApys } = require('./getGmxApys');
const { getGnsApys } = require('./getGnsApys');
const getRamsesApys = require('./getRamsesApys');
const getAuraArbitrumApys = require('./getAuraArbitrumApys');
const { getArbCompoundV3Apys } = require('./getArbCompoundV3Apys');
const { getBeefyArbCowApys } = require('./getBeefyArbCowApys');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const { getPendleApys } = require('../common/pendle/getPendleApys');
const { getMimApys } = require('./getMimApys');
const getVenusApys = require('./getVenusApys');
const getStargateArbApys = require('./getStargateArbApys');
const { getSiloApys } = require('../common/silo/getSiloApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { getEulerApys } = require('./getEulerApys');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');

const getApys = [
  getAuraArbitrumApys,
  // getGnsApys,
  () => getPendleApys(require('../../../data/arbitrum/pendlePools.json')),
  getMimApys,
  // getGmxV2Apys,
  getGmxApys,
  getCurveApys,
  // getBalancerArbApys,
  getRamsesApys,
  getArbCompoundV3Apys,
  getBeefyArbCowApys,
  // getAaveV3Apys,
  // getVenusApys,
  // getStargateArbApys,
  () => getSiloApys(chainId, require('../../../data/arbitrum/siloV2Pools.json')),
  () => getMorphoApys(chainId, require('../../../data/arbitrum/morphoPools.json')),
  getEulerApys,
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
