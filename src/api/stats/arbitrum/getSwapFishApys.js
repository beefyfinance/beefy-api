const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/arbitrum/swapFishLpPools.json');
// import { sushiArbitrumClient } from '../../../apollo/client';
// import { SUSHI_LPF } from '../../../constants';

export const getSwapFishApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029',
    tokenPerBlock: 'cakePerSecond',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'swapfish-fish',
        poolId: 0,
        address: '0xb348B87b23D5977E2948E6f36ca07E1EC94d7328',
        oracle: 'tokens',
        oracleId: 'SWAPFISH',
        decimals: '1e18',
      },
    ],
    oracleId: 'SWAPFISH',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // tradingFeeInfoClient: sushiArbitrumClient,
    // liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });
