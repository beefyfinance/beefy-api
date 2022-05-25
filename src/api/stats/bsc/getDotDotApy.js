import fetch from 'node-fetch';
import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { BSC_CHAIN_ID } from '../../../constants';
import { bscWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { getContract } from '../../../utils/contractHelper';
import getApyBreakdown from '../common/getApyBreakdown';
import fetchPrice from '../../../utils/fetchPrice';
import IEllipsisLpStaking from '../../../abis/bsc/EllipsisLpStaking.json';
import IEllipsisRewardToken from '../../../abis/EllipsisRewardToken.json';
import pools from '../../../data/bsc/ellipsisPools.json';

const baseApyUrl = 'https://api.ellipsis.finance/api/getAPRs';
const tradingFees = 0.0002;
const secondsPerYear = 31536000;
const shareAfterDotDotFee = 0.85;
const dotProxy = '0xD4d01C4367ed2D4AB5c2F734d640F7ffe558E8A8';
const ellipsisLpStaking = '0x5B74C99AA2356B4eAa7B85dC486843eDff8Dfdbe';

export const getDotDotApy = async () => {
  const baseApys = await getEllipsisBaseApys(pools, baseApyUrl);
  const farmApys = await getPoolApys(pools);
  const apy = getApyBreakdown(pools, baseApys, farmApys, tradingFees);
  // console.log(apy);
  return apy;
};

const getPoolApys = async pools => {
  const apys = [];
  const multicall = new MultiCall(web3, multicallAddress(BSC_CHAIN_ID));
  const ellipsis = getContract(IEllipsisLpStaking, ellipsisLpStaking);

  const poolInfoCalls = [];
  const rewardDataCalls = [];
  pools.forEach(pool => {
    poolInfoCalls.push({
      poolInfo: ellipsis.methods.poolInfo(pool.address),
      userInfo: ellipsis.methods.userInfo(pool.address, dotProxy),
    });
    pool.rewards?.forEach(reward => {
      const token = getContract(IEllipsisRewardToken, pool.address);
      rewardDataCalls.push({
        pool: pool.name,
        oracleId: reward.oracleId,
        rewardData: token.methods.rewardData(reward.token),
        totalSupply: token.methods.totalSupply(),
      });
    });
  });
  const res = await multicall.all([poolInfoCalls, rewardDataCalls]);
  const poolInfo = res[0].map(v => ({
    adjustedSupply: new BigNumber(v.poolInfo['0']),
    rewardsPerSecond: new BigNumber(v.poolInfo['1']),
    depositAmount: new BigNumber(v.userInfo['0']),
    adjustedAmount: new BigNumber(v.userInfo['1']),
  }));
  const rewards = res[1].map(v => ({
    ...v,
    periodFinish: v.rewardData['2'],
    rewardRate: new BigNumber(v.rewardData['3']),
    totalSupply: new BigNumber(v.totalSupply),
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
    // console.log(pool.name, 'EPX', epxApy.valueOf());

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
