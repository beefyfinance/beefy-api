const getRamenLpApys = require('./getRamenLpApys');
const getBlizzardApy = require('./getBlizzardApy');
const getBlizzardLpApys = require('./getBlizzardLpApys');
const getSaltLpApys = require('./getSaltLpApys');
const getApeApys = require('./getApeApys');
const getSpaceLpApys = require('./getSpaceLpApys');
const getZefiLpApys = require('./getZefiLpApys');
const getSwampApys = require('./getSwampApys');
const getSwampySwampApy = require('./getSwampySwampApy');
const getGoalLpApys = require('./getGoalLpApys');
const getPantherApys = require('./getPantherApys');
const getKingdefiApys = require('./getKingdefiApys');
const getRabbitFinanceApys = require('./getRabbitFinanceApys');
const getFruitApys = require('./getFruitApys');
const getPeraApys = require('./getPeraApys');
const getStableQuantApys = require('./getStableQuantApys');
const getViralataApys = require('./getViralataApys');
const getLongApys = require('./getLongApys');
const getCZFApys = require('./getCZFApys');
const getAnnexApys = require('./getAnnexApys');
const getPacocaApys = require('./getPacocaApys');
const getSingularApys = require('./getSingularApys');
const getCafeLpApys = require('./getCafeLpApys');
const getBabyApys = require('./getBabyApys');
const { getWSGApys } = require('./getWSGApys');
const getNftyApys = require('./getNftyApys');
const getBetuApys = require('./getBetuApys');
const getBisonApys = require('./getBisonApys');
const getBlockMineApys = require('./getBlockMineApys');
const getChargeApys = require('./getChargeApys');

const getApys = [
  getRamenLpApys,
  getBlizzardApy,
  getBlizzardLpApys,
  getSaltLpApys,
  getApeApys,
  // TODO remove all commented if no complains
  // getSoupApys,
  // getSquirrelApys,
  getSpaceLpApys,
  // getHpsApys,
  getZefiLpApys,
  // getThunderLpApys,
  getSwampApys,
  getSwampySwampApy,
  // getSwampyCakeLpApys,
  // getSwampyCakeApy,
  // getYieldBayLpApys,
  // getMarshLpApys,
  // getSatisLpApys,
  getGoalLpApys,
  // getTofyLpApys,
  // getGarudaApys,
  // getIronApys,
  // getIronDndApys,
  // getIronSingleApys,
  // getDumplingApys,
  getPantherApys,
  // getMemeFarmApys,
  getKingdefiApys,
  getRabbitFinanceApys,
  getFruitApys,
  getPeraApys,
  getStableQuantApys,
  // getHoneyFarmApys,
  getViralataApys,
  getLongApys,
  getCZFApys,
  // getPearzapApys,
  getAnnexApys,
  getPacocaApys,
  getSingularApys,
  getCafeLpApys,
  getBabyApys,
  getWSGApys,
  getNftyApys,
  getBetuApys,
  getBisonApys,
  getBlockMineApys,
  getChargeApys,
];

const getDegensLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getDegensApys error', result.reason);
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

module.exports = { getDegensLpApys };
