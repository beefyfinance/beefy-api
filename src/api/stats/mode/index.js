const { isFiniteNumber } = require('../../../utils/number');
const { getCampaignsForChainWithMeta } = require('../../offchain-rewards');
const { getBeefyCowModeApys } = require('./getBeefyCowModeApys');

const getApys = [getBeefyCowModeApys];

const getModeApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);
  const offchainCampaigns = await getCampaignsForChainWithMeta('mode');
  const activeCampaigns = offchainCampaigns.campaigns.filter(campaign => campaign.active === true);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getModeApys error', result.reason);
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

  // Add off-chain reward data to APYs
  for (const campaign of activeCampaigns) {
    for (const vault of campaign.vaults) {
      if (!apys[vault.id]) {
        console.warn(`No base apy found for vault ${vault.id} which has an active campaign`);
        continue;
      }
      if (!isFiniteNumber(vault.apr)) continue;
      apys[vault.id] += apys[vault.id] + vault.apr;

      if (!apyBreakdowns[vault.id]) continue;
      apyBreakdowns[vault.id].totalApy += vault.apr;
      apyBreakdowns[vault.id][campaign.providerId] =
        (apyBreakdowns[vault.id][campaign.providerId] ?? 0) + vault.apr;
    }
  }

  const end = Date.now();
  console.log(`> [APY] Mode finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = { getModeApys };
