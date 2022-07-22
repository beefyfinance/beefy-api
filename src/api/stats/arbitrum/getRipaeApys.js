const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/arbitrum/ripaeLpPools.json');
import { sushiArbitrumClient } from '../../../apollo/client';
import { SUSHI_LPF } from '../../../constants';

const getRipaeApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x4d1D896FD501788d8605f672AD72fC05Fe5ab311',
    tokenPerBlock: 'paePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'sETH',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: sushiArbitrumClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });

module.exports = getRipaeApys;
