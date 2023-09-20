import { ETH_CHAIN_ID } from '../../../constants';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import { fetchContract } from '../../rpc/client';
import IRewardPool from '../../../abis/IRewardPool';

const secondsPerYear = 31536000;

const pool = {
  name: 'convex-staked-cvx',
  rewardPool: '0xCF50b810E57Ac33B91dCF525C6ddd9881B139332',
};

export const getConvexCvxApy = async () => {
  const rewardPool = fetchContract(pool.rewardPool, IRewardPool, ETH_CHAIN_ID);
  const res = await Promise.all([rewardPool.read.totalSupply(), rewardPool.read.rewardRate()]);

  const totalSupply = new BigNumber(res[0].toString());
  const rewardRate = new BigNumber(res[1].toString());

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'CVX' });
  const totalStakedInUsd = totalSupply.times(tokenPrice).div('1e18');
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxCRV' });
  const rewardsInUsd = rewardRate.times(secondsPerYear).times(rewardPrice).div('1e18');

  let apr = rewardsInUsd.div(totalStakedInUsd);
  // console.log(pool.name, rewardsInUsd.div(totalStakedInUsd).toNumber());
  return getApyBreakdown([{ name: pool.name, address: pool.name }], {}, [apr], 0);
};
