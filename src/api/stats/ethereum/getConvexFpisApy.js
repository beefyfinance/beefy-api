import { ETH_CHAIN_ID } from '../../../constants';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import ICvxFxsStaking from '../../../abis/ethereum/ICvxFxsStaking';
import { fetchContract } from '../../rpc/client';

const secondsPerYear = 31536000;

const pool = {
  name: 'convex-staked-cvxFPIS',
  rewardPool: '0xfA87DB3EAa93B7293021e38416650D2E666bC483',
  rewards: [
    { address: '0xc2544A32872A91F4A553b404C6950e89De901fdb', oracleId: 'FPIS' },
    { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' },
  ],
};

export const getConvexFpisApy = async () => {
  const rewardInfo = [];
  const rewardData = [];

  const rewardPool = fetchContract(pool.rewardPool, ICvxFxsStaking, ETH_CHAIN_ID);
  const totalSupplyCall = rewardPool.read.totalSupply();
  pool.rewards?.forEach(r => {
    rewardInfo.push({ address: r.address });
    rewardData.push(rewardPool.read.rewardData([r.address]));
  });

  const res = await Promise.all([totalSupplyCall, Promise.all(rewardData)]);
  const totalSupply = new BigNumber(res[0].toString());
  const rewards = rewardInfo.map((_, index) => ({
    ...rewardInfo[index],
    periodFinish: new BigNumber(res[1][index]['0'].toString()),
    rewardRate: new BigNumber(res[1][index]['1'].toString()),
  }));

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxFPIS' });
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
    // console.log(pool.name, poolReward.oracleId, rewardsInUsd.div(totalStakedInUsd).toNumber(), totalStakedInUsd.toNumber());
  }
  return getApyBreakdown([{ name: pool.name, address: pool.name }], {}, [apr], 0);
};
