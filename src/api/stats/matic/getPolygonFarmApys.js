const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/polygonFarmLpPools.json');
import { sushiClient } from '../../../apollo/client';

const getPolygonFarmApys = async () =>
  await getMasterChefApys({
    masterchef: '0x9A2C85eFBbE4DD93cc9a9c925Cea4A2b59c0db78',
    tokenPerBlock: 'SpadePerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SPADE',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: sushiClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = { getPolygonFarmApys };
