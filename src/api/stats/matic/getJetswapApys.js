const { getMasterChefApys } = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/MasterChef.json');
const pools = require('../../../data/matic/jetswapLpPools.json');
import { jetswapPolyClient } from '../../../apollo/client';

const getJetswapApys = async () =>
  await getMasterChefApys({
    masterchef: '0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'jetswap-poly-pwings',
        poolId: 0,
        address: '0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25',
        oracle: 'tokens',
        oracleId: 'pWINGS',
        decimals: '1e18',
      },
    ],
    oracleId: 'pWINGS',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: jetswapPolyClient,
    liquidityProviderFee: 0.001,
    // log: true,
  });

module.exports = getJetswapApys;
