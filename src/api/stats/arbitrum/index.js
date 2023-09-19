const { getSushiLpApys } = require('./getSushiApys');
const { getCurveApys } = require('./getCurveApys');
const { getSushiMimApys } = require('./getSushiMimApys');
const { getSpellApys } = require('./getSpellApys');
const getBalancerArbApys = require('./getBalancerArbApys');
const { getArbiBifiGovApy } = require('./getArbiBifiGovApy');
const { getArbiBifiMaxiApy } = require('./getArbiBifiMaxiApy');
const getStargateArbApys = require('./getStargateArbApys');
const getRipaeApys = require('./getRipaeApys');
const { getGmxApys } = require('./getGmxApys');
const { getHopApys } = require('./getHopApys');
const { getConvexApys } = require('./getConvexApys');
const { getSwapFishApys } = require('./getSwapFishApys');
const { getGnsApys } = require('./getGnsApys');
const getKyberArbitrumApys = require('./getKyberArbitrumApys');
const getSolidLizardApys = require('./getSolidLizardApys');
const getRamsesApys = require('./getRamsesApys');
const getArbidexApys = require('./getArbidexApys');
const { getChronosApys } = require('./getChronosApys');
const getAuraArbitrumApys = require('./getAuraArbitrumApys');
const { getJoeAutoArbApys } = require('./getJoeAutoArbApys');
const getUniswapGammaApys = require('./getUniswapGammaApys');

const getApys = [
  getUniswapGammaApys,
  getJoeAutoArbApys,
  getAuraArbitrumApys,
  getKyberArbitrumApys,
  getGnsApys,
  getHopApys,
  getGmxApys,
  getRipaeApys,
  getSushiLpApys,
  getCurveApys,
  getConvexApys,
  getSushiMimApys,
  getSpellApys,
  getBalancerArbApys,
  getArbiBifiGovApy,
  getArbiBifiMaxiApy,
  getStargateArbApys,
  getSwapFishApys,
  getSolidLizardApys,
  getRamsesApys,
  getChronosApys,
  getArbidexApys,
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
