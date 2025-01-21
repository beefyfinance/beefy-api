import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';
import { stellaClient } from '../../../apollo/client';
import { stellaswap } from '../../../../packages/address-book/src/address-book/moonbeam/platforms';

const poolsV2 = require('../../../data/moonbeam/stellaswapLpV2Pools.json');

const getStellaswapApys = async () =>
  await getMultiRewardMasterChefApys({
    chainId: chainId,
    masterchef: stellaswap.masterchefV1distributorV2,
    tokenPerBlock: 'stellaPerSec',
    hasMultiplier: false,
    secondsPerBlock: 1, // because tokenPerBlock is expressed in seconds
    pools: [...poolsV2],
    oracleId: 'STELLA',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: stellaClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });

module.exports = { getStellaswapApys };
