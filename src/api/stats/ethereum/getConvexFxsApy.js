import { ETH_CHAIN_ID } from '../../../constants';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import ICvxFxsStaking from '../../../abis/ethereum/ICvxFxsStaking';
import { fetchContract } from '../../rpc/client';

const secondsPerYear = 31536000;

const pool = {
  name: 'convex-staked-cvxFXS',
  rewardPool: '0x49b4d1dF40442f0C31b1BbAEA3EDE7c38e37E31a',
  rewards: [
    { address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', oracleId: 'FXS' },
    { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' },
  ],
};

export const getConvexFxsApy = async () => {
  const rewardsInfo = [];
  const rewardDataCalls = [];

  const rewardPool = fetchContract(pool.rewardPool, ICvxFxsStaking, ETH_CHAIN_ID);
  const totalSupplyCall = rewardPool.read.totalSupply();
  pool.rewards?.forEach(r => {
    rewardsInfo.push({ address: r.address });
    rewardDataCalls.push(rewardPool.read.rewardData([r.address]));
  });
  const res = await Promise.all([totalSupplyCall, Promise.all(rewardDataCalls)]);

  const totalSupply = new BigNumber(res[0].toString());
  const rewards = rewardsInfo.map((_, index) => ({
    ...rewardsInfo[index],
    periodFinish: new BigNumber(res[1][index]['0'].toString()),
    rewardRate: new BigNumber(res[1][index]['1'].toString()),
  }));

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxFXS' });
  const totalStakedInUsd = totalSupply.times(tokenPrice).div('1e18');

  let apr = new BigNumber(0);

  for (const r of rewards) {
    if (r.periodFinish < Date.now() / 1000) continue;
    const poolReward = pool.rewards.find(e => e.address === r.address);
    const price = await fetchPrice({
      oracle: poolReward.oracle ?? 'tokens',
      id: poolReward.oracleId,
    });
    const rewardsInUsd = r.rewardRate.times(secondsPerYear).times(price).div('1e18');
    apr = apr.plus(rewardsInUsd.div(totalStakedInUsd));
    // console.log(pool.name, poolReward.oracleId, rewardsInUsd.div(totalStakedInUsd).toNumber());
  }

  return getApyBreakdown([{ name: pool.name, address: pool.name }], {}, [apr], 0);
};
