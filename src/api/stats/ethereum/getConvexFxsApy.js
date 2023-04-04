import { MultiCall } from 'eth-multicall';
import { ethereumWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import { getContract } from '../../../utils/contractHelper';
import ICvxFxs from '../../../abis/ethereum/ICvxFxsStaking.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';

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
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rewardPoolCalls = [];
  const rewardCalls = [];

  const rewardPool = getContract(ICvxFxs, pool.rewardPool);
  rewardPoolCalls.push({
    totalSupply: rewardPool.methods.totalSupply(),
  });
  pool.rewards?.forEach(r => {
    rewardCalls.push({
      address: r.address,
      rewardData: rewardPool.methods.rewardData(r.address),
    });
  });
  const res = await multicall.all([rewardPoolCalls, rewardCalls]);
  const info = res[0].map(v => ({
    totalSupply: new BigNumber(v.totalSupply),
  }))[0];
  const rewards = res[1].map(v => ({
    ...v,
    periodFinish: v.rewardData['0'],
    rewardRate: new BigNumber(v.rewardData['1']),
  }));

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxFXS' });
  const totalStakedInUsd = info.totalSupply.times(tokenPrice).div('1e18');

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
