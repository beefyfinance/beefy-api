const { getMasterChefApys } = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/degens/SwampChef.json');
const pools = require('../../../data/matic/swampLpPools.json');
import { quickClient } from '../../../apollo/client';

const getSwampApys = async () =>
  await getMasterChefApys({
    masterchef: '0x4F04e540A51013aFb6761ee73D71d2fB1F29af80',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'NATIVEPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'swamp-pswamp',
        poolId: 0,
        address: '0x5f1657896B38c4761dbc5484473c7A7C845910b6',
        strat: '0x6Dbf28f426Be8Ea13a191A45D3A1E70579dAc1E2',
        oracle: 'tokens',
        oracleId: 'pSWAMP',
        decimals: '1e18',
      },
    ],
    oracleId: 'pSWAMP',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getSwampApys;
