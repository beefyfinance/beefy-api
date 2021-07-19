const getMasterChefApys = require('./getBscMasterChefApys');

const MasterChef = require('../../../../abis/MasterChef.json');
const pools = require('../../../../data/degens/fruitLpPools.json');
const { APE_LPF } = require('../../../../constants');
const { apeClient } = require('../../../../apollo/client');

const getFruitApys = async () =>
  await getMasterChefApys({
    masterchef: '0x5a6B8dc5ef864f7bE2cD9F1BDF32DC1d1836376C',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'FRUIT',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: APE_LPF,
  });

module.exports = getFruitApys;
