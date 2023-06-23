import { merge } from 'lodash';
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';
import { stellaClient } from '../../../apollo/client';
import { stellaswap } from '../../../../packages/address-book/address-book/moonbeam/platforms/stellaswap';
const poolsV1 = require('../../../data/moonbeam/stellaswapLpPools.json');
const poolsV2 = require('../../../data/moonbeam/stellaswapLpV2Pools.json');
const stablePools = require('../../../data/moonbeam/stellaswapStablePools.json');
const getBlockTime = require('../../../utils/getBlockTime');

const getStellaswapApys = async () =>
  merge(
    await getMasterChefApys({
      chainId: chainId,
      masterchef: stellaswap.masterchef,
      tokenPerBlock: 'stellaPerBlock',
      hasMultiplier: false,
      secondsPerBlock: await getBlockTime(1284),
      pools: poolsV1,
      oracleId: 'STELLA',
      oracle: 'tokens',
      decimals: '1e18',
      tradingFeeInfoClient: stellaClient,
      liquidityProviderFee: 0.0025,
      // log: true,
    }),
    await getMultiRewardMasterChefApys({
      chainId: chainId,
      masterchef: stellaswap.masterchefV1distributorV2,
      tokenPerBlock: 'stellaPerSec',
      hasMultiplier: false,
      secondsPerBlock: 1, // because tokenPerBlock is expressed in seconds
      pools: [...poolsV2, ...stablePools],
      oracleId: 'STELLA',
      oracle: 'tokens',
      decimals: '1e18',
      tradingFeeInfoClient: stellaClient,
      liquidityProviderFee: 0.0025,
      // log: true,
    })
  );

module.exports = { getStellaswapApys };
