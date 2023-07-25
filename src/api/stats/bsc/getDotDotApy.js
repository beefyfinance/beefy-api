import BigNumber from 'bignumber.js';
import { BSC_CHAIN_ID } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';
import fetchPrice from '../../../utils/fetchPrice';
import pools from '../../../data/bsc/ellipsisPools.json';
import EllipsisLpStaking from '../../../abis/bsc/EllipsisLpStaking';
import EllipsisRewardToken from '../../../abis/EllipsisRewardToken';
import { fetchContract } from '../../rpc/client';

const baseApyUrl = 'https://api.ellipsis.finance/api/getAPRs';
const tradingFees = 0.0002;
const secondsPerYear = 31536000;
const shareAfterDotDotFee = 0.85;
const dotProxy = '0xD4d01C4367ed2D4AB5c2F734d640F7ffe558E8A8';
const ellipsisLpStaking = '0x5B74C99AA2356B4eAa7B85dC486843eDff8Dfdbe';

export const getDotDotApy = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getEllipsisBaseApys(pools, baseApyUrl),
    getPoolApys(pools),
  ]);
  const apy = getApyBreakdown(pools, baseApys, farmApys, tradingFees);
  // console.log(apy);
  return apy;
};

const getPoolApys = async pools => {
  const apys = [];
  const ellipsis = fetchContract(ellipsisLpStaking, EllipsisLpStaking, BSC_CHAIN_ID);

  const poolInfoCalls = [];
  const userInfoCalls = [];
  const rewardInfo = [];
  const rewardDataCalls = [];
  const totalSupplyCalls = [];

  pools.forEach(pool => {
    poolInfoCalls.push(ellipsis.read.poolInfo([pool.address]));
    userInfoCalls.push(ellipsis.read.userInfo([pool.address, dotProxy]));

    pool.rewards?.forEach(reward => {
      const token = fetchContract(pool.address, EllipsisRewardToken, BSC_CHAIN_ID);
      rewardInfo.push({ pool: pool.name, oracleId: reward.oracleId });
      rewardDataCalls.push(token.read.rewardData([reward.token]));
      totalSupplyCalls.push(token.read.totalSupply());
    });
  });
  const res = await Promise.all([
    Promise.all(poolInfoCalls),
    Promise.all(userInfoCalls),
    Promise.all(rewardDataCalls),
    Promise.all(totalSupplyCalls),
  ]);

  const poolInfo = poolInfoCalls.map((_, i) => ({
    adjustedSupply: new BigNumber(res[0][i]['0'].toString()),
    rewardsPerSecond: new BigNumber(res[0][i]['1'].toString()),
    depositAmount: new BigNumber(res[1][i]['0'].toString()),
    adjustedAmount: new BigNumber(res[1][i]['1'].toString()),
  }));
  const rewards = res[2].map((_, i) => ({
    ...rewardInfo[i],
    periodFinish: res[2][i]['2'],
    rewardRate: new BigNumber(res[2][i]['3'].toString()),
    totalSupply: new BigNumber(res[3][i].toString()),
  }));

  const epxPrice = await fetchPrice({ oracle: 'tokens', id: 'EPX' });
  const dddPrice = await fetchPrice({ oracle: 'tokens', id: 'DDD' });

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];
    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.adjustedSupply.times(lpPrice).div('1e18');
    const epxPerYear = info.rewardsPerSecond.times(secondsPerYear);

    // 0.4..1, 1 == max boost
    const boost = info.adjustedAmount.div(info.depositAmount);
    const yearlyRewards = epxPerYear.times(boost).times(shareAfterDotDotFee);
    const yearlyRewardsInUsd = yearlyRewards.times(epxPrice).div('1e18');
    const epxApy = yearlyRewardsInUsd.div(totalStakedInUsd);
    // console.log(pool.name, 'EPX', totalStakedInUsd.valueOf(), epxApy.valueOf());

    let apy = epxApy;

    const epxRewardsToDotDot = epxPerYear.times(info.adjustedAmount).div(info.adjustedSupply);
    const dddRewards = epxRewardsToDotDot.times(shareAfterDotDotFee).div(20).times(3);
    const dddRewardsInUsd = dddRewards.times(dddPrice).div('1e18');
    const dddStaked = info.depositAmount.times(lpPrice).div('1e18');
    const dddApy = dddRewardsInUsd.div(dddStaked);
    // console.log(pool.name, 'DDD', dddApy.valueOf());
    apy = apy.plus(dddApy);

    for (const r of rewards.filter(p => p.pool === pool.name)) {
      if (r.periodFinish < Date.now() / 1000) {
        continue;
      }
      const price = await fetchPrice({ oracle: 'tokens', id: r.oracleId });
      const totalSupply = r.totalSupply.times(lpPrice).div('1e18');
      const yearlyRewardsInUsd = r.rewardRate.times(secondsPerYear).times(price).div('1e18');
      const rewardApy = yearlyRewardsInUsd.div(totalSupply);
      // console.log(pool.name, r.oracleId, rewardApy.valueOf());
      apy = apy.plus(rewardApy);
    }

    apys.push(apy);
  }

  return apys;
};

const getEllipsisBaseApys = async (pools, url) => {
  let apys = {};
  try {
    const response = await fetch(url).then(res => res.json());
    let apyData = Object.fromEntries(Object.values(response.data).map(v => [v.address, v.baseApr]));
    pools.forEach(pool => {
      let apy = new BigNumber(apyData[pool.minter] ?? 0).div(100);
      apys = { ...apys, ...{ [pool.address.toLowerCase()]: apy } };
    });
  } catch (err) {
    console.error('Ellipsis base apy error ', url, err);
  }
  return apys;
};
