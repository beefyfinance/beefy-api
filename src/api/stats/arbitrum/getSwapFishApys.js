const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/arbitrum/swapFishLpPools.json');
// import { sushiArbitrumClient } from '../../../apollo/client';
// import { SUSHI_LPF } from '../../../constants';

export const getSwapFishApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029',
    tokenPerBlock: 'cakePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SWAPFISH',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // tradingFeeInfoClient: sushiArbitrumClient,
    // liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });
