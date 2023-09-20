const { getAuraApys } = require('./getAuraApys');
const { getConvexApys } = require('./getConvexApys');
const getStargateEthApys = require('./getStargateEthApys');
const getEthereumBifiGovApy = require('./getEthereumBifiEarningsApy');
const getAuraBalApy = require('./getAuraBalApy');
const { getSushiApys } = require('./getSushiLpApys');
const { getSynapseLpApys } = require('./getSynapseLpApys');
const getSolidlyApys = require('./getSolidlyApys');
const { getConvexCrvApy } = require('./getConvexCrvApy');
const { getConvexFxsApy } = require('./getConvexFxsApy');
const getEulerApys = require('./getEulerApys');
const { getVerseLpApys } = require('./getVerseApys');
const { getEthereumBifiMaxiApy } = require('./getEthereumBifiMaxiApy');
const { getConvexFpisApy } = require('./getConvexFpisApy');
const { getCurveApys } = require('./getCurveApys');
const { getConicApys } = require('./getConicApys');
const { getApeStakingApy } = require('./getApeStakingApy');
const { getConvexCvxApy } = require('./getConvexCvxApy');

const getApys = [
  getApeStakingApy,
  getAuraApys,
  getCurveApys,
  getConvexApys,
  getConvexCrvApy,
  getConvexFxsApy,
  getConvexFpisApy,
  getConvexCvxApy,
  getConicApys,
  getStargateEthApys,
  getEthereumBifiGovApy,
  getEthereumBifiMaxiApy,
  getAuraBalApy,
  getSushiApys,
  getSynapseLpApys,
  getSolidlyApys,
  // getEulerApys, // => delete this? code already doesn't work...
  getVerseLpApys,
];

const getEthereumApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEthereumApys error', result.reason);
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
  console.log(`> [APY] Ethereum finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getEthereumApys };
