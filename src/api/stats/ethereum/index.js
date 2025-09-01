const { getAuraApys } = require('./getAuraApys');
const { getConvexApys } = require('./getConvexApys');
const { getConvexCrvApy } = require('./getConvexCrvApy');
const { getBifiMaxiApy } = require('./getBifiMaxiApy');
const { getConvexCvxTokensApy } = require('./getConvexCvxTokensApy');
const { getCurveApys } = require('./getCurveApys');
const { getConvexCvxApy } = require('./getConvexCvxApy');
const { getETHCompoundV3Apys } = require('./getEthCompoundApys');
const { getbeQIApy } = require('./getbeQIApy');
const { getFxApys } = require('./getFxApys');
const { getPenpieApys } = require('./getPenpieApys');
const { getSkyApy } = require('./getSkyApy');
const { getEquilibriaApys } = require('../common/getEquilibriaApys');
const { getTokemakApys } = require('./getTokemakApys');
const { getMorphoApys } = require('../common/morpho/getMorphoApys');
const { ETH_CHAIN_ID } = require('../../../constants');
const { getUsualApys } = require('./getUsualApys');
const getStargateEthApys = require('./getStargateEthApys');

const getApys = [
  getAuraApys,
  getbeQIApy,
  getCurveApys,
  getConvexApys,
  getConvexCrvApy,
  getConvexCvxApy,
  getConvexCvxTokensApy,
  getFxApys,
  getBifiMaxiApy,
  getPenpieApys,
  () => getEquilibriaApys(require('../../../data/ethereum/pendlePools.json')),
  () => getMorphoApys(ETH_CHAIN_ID, require('../../../data/ethereum/morphoPools.json')),
  getETHCompoundV3Apys,
  getSkyApy,
  getUsualApys,
  getTokemakApys,
  getStargateEthApys,
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
