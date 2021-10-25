const { getMasterChefApys } = require('./getMaticMasterChefApys');
const {
  addressBook: {
    polygon: {
      tokens: { BONE, BALL },
      platforms: { polypupBone, polypupBall },
    },
  },
} = require('../../../../packages/address-book/address-book');

const { QUICK_LPF } = require('../../../constants');
const MasterChefAbi = require('../../../abis/matic/PolypupBoneMasterChef.json');
const BallMasterChefAbi = require('../../../abis/matic/PolypupBallMasterChef.json');
const bonePools = require('../../../data/matic/polypupLpPools.json');
const boneSinglePools = require('../../../data/matic/polypupSinglePools.json');
const ballPools = require('../../../data/matic/polypupBallLpPools.json');
const ballSinglePools = require('../../../data/matic/polypupBallSinglePools.json');
const { quickClient } = require('../../../apollo/client');
const { getEDecimals } = require('../../../utils/getEDecimals');

const getPolypupApys = async () => {
  const bone = getMasterChefApys({
    masterchef: polypupBone.masterchef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'BonePerBlock',
    hasMultiplier: false,
    singlePools: boneSinglePools,
    pools: bonePools,
    oracle: 'tokens',
    oracleId: BONE.symbol,
    decimals: getEDecimals(BONE.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

  const ball = getMasterChefApys({
    masterchef: polypupBall.masterchef,
    masterchefAbi: BallMasterChefAbi,
    tokenPerBlock: 'BallPerBlock',
    hasMultiplier: false,
    singlePools: ballSinglePools,
    pools: ballPools,
    oracle: 'tokens',
    oracleId: BALL.symbol,
    decimals: getEDecimals(BALL.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  let promises = [bone, ball];
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getPolypupApys error', result.reason);
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

module.exports = { getPolypupApys };
