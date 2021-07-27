const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/polyCrackerLpPools.json');
import { quickClient } from '../../../apollo/client';

const getPolyCrackerApys = async () =>
  await getMasterChefApys({
    masterchef: '0xfcD73006121333C92D770662745146338E419556',
    tokenPerBlock: 'lithPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'polycracker-lith',
        poolId: 6,
        address: '0xfE1a200637464FBC9B60Bc7AeCb9b86c0E1d486E',
        oracle: 'tokens',
        oracleId: 'LITH',
        decimals: '1e18',
      },
    ],
    oracleId: 'LITH',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.003,
    log: true,
  });

module.exports = getPolyCrackerApys;
