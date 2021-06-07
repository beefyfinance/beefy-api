const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/IronMasterChef.json');
const pools = require('../../../data/matic/ironLpPools.json');
const quickPools = require('../../../data/matic/ironQuickLpPools.json');
const ironTitanPools = require('../../../data/matic/ironTitanLpPools.json');
const { sushiClient, quickClient } = require('../../../apollo/client');
const { quickLiquidityProviderFee } = require('./getQuickLpApys');
const { sushiLiquidityProviderFee } = require('./getSushiLpApys');
const { addressBook } = require('blockchain-addressbook');
const {
  polygon: {
    platforms: { iron },
    tokens: { TITAN, USDC },
  },
} = addressBook;
const {
  getScientificNotationFromTokenDecimals,
} = require('../../../utils/getScientificNotationFromTokenDecimals');

const getIronApys = async () => {
  const lps = getMasterChefApys({
    masterchef: iron.masterchef_LPs,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracle: 'tokens',
    oracleId: TITAN.symbol,
    decimals: getScientificNotationFromTokenDecimals(TITAN.decimals),
    // log: true,
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: sushiLiquidityProviderFee,
  });

  const quickLPs = getMasterChefApys({
    masterchef: iron.masterchef_LPs,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: quickPools,
    oracle: 'tokens',
    oracleId: TITAN.symbol,
    decimals: getScientificNotationFromTokenDecimals(TITAN.decimals),
    // log: true,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: quickLiquidityProviderFee,
  });

  const ironTitan = getMasterChefApys({
    masterchef: iron.masterchef_IronTitanLP,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: ironTitanPools,
    oracle: 'tokens',
    oracleId: TITAN.symbol,
    decimals: getScientificNotationFromTokenDecimals(TITAN.decimals),
    // log: true,
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: sushiLiquidityProviderFee,
  });

  const single = getMasterChefApys({
    masterchef: iron.masterchef_TitanSingleAsset,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'iron-titan',
        poolId: 0,
        address: TITAN.address,
        oracle: 'tokens',
        oracleId: TITAN.symbol,
        decimals: getScientificNotationFromTokenDecimals(TITAN.decimals),
      },
    ],
    oracle: 'tokens',
    oracleId: USDC.symbol,
    decimals: getScientificNotationFromTokenDecimals(USDC.decimals),
    // log: true,
  });

  let apys = {};
  const values = await Promise.all([lps, quickLPs, ironTitan, single]);
  for (const item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

module.exports = getIronApys;
