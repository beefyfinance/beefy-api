const { bscWeb3: web3 } = require('../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/swapFishLpPools.json');
// import { sushiArbitrumClient } from '../../../apollo/client';
// import { SUSHI_LPF } from '../../../constants';

export const getSwapFishApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x671eFBa3F6874485cC39535fa7b525fe764985e9',
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
