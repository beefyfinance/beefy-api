import { fetchPrice } from '../../../utils/fetchPrice';
import BigNumber from 'bignumber.js';
import { getPoolsData } from '../common/getRewardPoolApys';

const { BSC_CHAIN_ID: chainId } = require('../../../constants');
const ichiPools = require('../../../data/bsc/pancakeIchiPools.json');
const rangePools = require('../../../data/bsc/pancakeRangePools.json');
const { getApyBreakdown } = require('../common/getApyBreakdown');

const pools = [...ichiPools, ...rangePools];

export const getPancakeIchiApys = async () => {
  const { apys, tradingAprs } = await getFarmApys();

  return getApyBreakdown(pools, tradingAprs, apys, 0);
};

const getFarmApys = async () => {
  const apys = [];
  const tradingAprs = {};
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'Cake' });

  const { balances, rewardRates, periodFinishes } = await getPoolsData({
    chainId: chainId,
    pools: pools,
    cake: true,
  });

  let tradingAprReponse = [];
  try {
    tradingAprReponse = await fetch('https://vault-api.pancake.run/api/v1/56/vault/feeAvg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avgFeeCalculationDays: '1' }),
    }).then(res => res.json());
  } catch (e) {
    console.error('Failed to fetch Pancake Ichi Aprs');
  }

  // console.log(tradingAprReponse)

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy('1e18');

    const secondsPerYear = 31536000;
    const yearlyRewards = rewardRates[i].times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

    const apy = periodFinishes[i].isGreaterThanOrEqualTo(Math.floor(Date.now() / 1000))
      ? yearlyRewardsInUsd.dividedBy(totalStakedInUsd)
      : new BigNumber(0);
    apys.push(apy);

    let tradingApr = new BigNumber(0);
    for (let j = 0; j < tradingAprReponse.length; j++) {
      let v = tradingAprReponse[j];
      if (v.lpAddress.toLowerCase() === pools[i].address.toLowerCase()) {
        const token0Price = await fetchPrice({ oracle: 'tokens', id: pool.lp0.oracleId });
        const token1Price = await fetchPrice({ oracle: 'tokens', id: pool.lp1.oracleId });

        const feesInToken0 = new BigNumber(v.token0)
          .times(token0Price)
          .dividedBy(pool.lp0.decimals);
        const feesInToken1 = new BigNumber(v.token1)
          .times(token1Price)
          .dividedBy(pool.lp1.decimals);

        const totalFeesInADay = feesInToken0.plus(feesInToken1);

        tradingApr = totalFeesInADay.times(365).dividedBy(totalStakedInUsd);
      }
    }

    tradingAprs[pool.address.toLowerCase()] = tradingApr;
  }

  return { apys, tradingAprs };
};
