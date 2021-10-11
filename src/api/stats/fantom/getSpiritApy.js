const getMasterChefApys = require('./getFantomMasterChefApys');

const MasterChefAbi = require('../../../abis/fantom/SpiritChef.json');
const spiritPools = require('../../../data/fantom/spiritPools.json');
const { spiritClient } = require('../../../apollo/client');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const { FANTOM_CHAIN_ID: chainId, SPIRIT_LPF } = require('../../../constants');
const pools = require('../../../data/fantom/spiritGauges.json');

const getSpiritApys = async () => {
  const single = getMasterChefApys({
    masterchef: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'spiritPerBlock',
    hasMultiplier: true,
    singlePools: [
      {
        name: 'spirit-spirit',
        poolId: 0,
        address: '0x5Cc61A78F164885776AA610fb0FE1257df78E59B',
        oracle: 'tokens',
        oracleId: 'SPIRIT',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'SPIRIT',
    decimals: '1e18',
    // log: true,
  });

  const spirit = getMasterChefApys({
    masterchef: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'spiritPerBlock',
    hasMultiplier: true,
    pools: spiritPools.filter(pool => !!pool.poolId),
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: SPIRIT_LPF,
  });

  const gaugeAPYs = getGaugeAPYs();

  let apys = {};
  let apyBreakdowns = {};

  let promises = [spirit, single, gaugeAPYs];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getSpiritApys error', result.reason);
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

const getGaugeAPYs = async () => {
  return getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: [...pools],
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: SPIRIT_LPF,
    //log: true,
  });
};

module.exports = getSpiritApys;
