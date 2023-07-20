import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';

const pools = require('../../../data/arbitrum/sushiLpPools.json');
const { SUSHI_LPF } = require('../../../constants');
import { sushiArbitrumClient } from '../../../apollo/client';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';

const getSushiLpApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
    masterchefAbi: SushiMiniChefV2,
    tokenPerBlock: 'sushiPerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    allocPointIndex: '2',
    pools: pools,
    oracleId: 'SUSHI',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: sushiArbitrumClient,
    liquidityProviderFee: SUSHI_LPF,
    // log: true,
  });

module.exports = { getSushiLpApys };
