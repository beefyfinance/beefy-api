const getBeetsOpApys = require('./getBeetsOpApys');
const { getCurveApys } = require('./getCurveApys');
const getVelodromeApys = require('./getVelodromeApys');
const getStargateOpApys = require('./getStargateOpApys');
const getbeVeloApy = require('./getbeVeloApy');
const { getAaveV3Apys } = require('./getAaveV3Apys');
const { getRipaeApys } = require('./getRipaeApys');
const { getHopApys } = require('./getHopApys');
const { getHopOpApys } = require('./getHopOpApys');
const { getOlpApys } = require('./getOlpApys');
const getBeOpxApy = require('./getBeOpxApy');
const getBeOpxEarnApy = require('./getBeOpxEarnApy');
const getKyberOptimismApys = require('./getKyberOptimismApys');
const getMmyApys = require('./getMmyApys');
const getExactlyApys = require('./getExactlyApys');
const getBalancerOpApys = require('./getBalancerOpApys');
const getAuraApys = require('./getAuraOptimismApys');
const getBeVeloV2Apr = require('./getBeVeloV2Apr');
const getUniswapGammaApys = require('./getUniswapGammaApys');
const { getSonneApys } = require('./getSonneApys');
const { getBeefyOPCowApys } = require('./getBeefyOPCowApys');

const getApys = [
  getSonneApys,
  getUniswapGammaApys,
  getAuraApys,
  getBalancerOpApys,
  getExactlyApys,
  getMmyApys,
  getKyberOptimismApys,
  getBeetsOpApys,
  getCurveApys,
  getVelodromeApys,
  getStargateOpApys,
  getbeVeloApy,
  getAaveV3Apys,
  getRipaeApys,
  getHopApys,
  getHopOpApys,
  getOlpApys,
  getBeOpxApy,
  getBeOpxEarnApy,
  getBeVeloV2Apr,
  getBeefyOPCowApys,
];

const getOptimismApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getOptimismApys error', result.reason);
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
  console.log(`> [APY] Optimism finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getOptimismApys };
