const getMasterChefApys = require('./getBscMasterChefApys');

const FairLaunch = require('../../../../abis/degens/StableQuantFairLaunch.json');
const pools = require('../../../../data/degens/stablequantLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getStableQuantApys = async () =>
  await getMasterChefApys({
    masterchef: '0xa64bCE877192142d71D670a95aaa73E4f4033B62',
    masterchefAbi: FairLaunch,
    tokenPerBlock: 'quantPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'QUANT',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.003,
  });

module.exports = getStableQuantApys;
