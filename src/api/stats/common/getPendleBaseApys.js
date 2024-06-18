import BigNumber from 'bignumber.js';

export const getPendleApys = async (chainId, pools) => {
  let tradingApys = {};
  const pendleApys = [];
  const syRewardsApys = [];
  try {
    const response = await fetch(
      `https://api-v2.pendle.finance/core/v1/${chainId}/markets?limit=100&is_active=true`
    ).then(res => res.json());
    pools.forEach(pool => {
      let baseApy = new BigNumber(0);
      let pendleApy = new BigNumber(0);
      let syRewardsApy = new BigNumber(0);
      const res = response.results.find(
        r => r.address.toLowerCase() === pool.address.toLowerCase()
      );
      if (res) {
        baseApy = new BigNumber(res.swapFeeApy || 0);
        const ptUsd = res.totalPt * res.pt?.price?.usd || 0;
        const syUsd = res.totalSy * res.sy?.price?.usd || 0;
        const totalUsd = res.liquidity?.usd || 1;
        const underlyingApy = new BigNumber(res.underlyingInterestApy || 0)
          .times(syUsd)
          .div(totalUsd);
        const ptFixedApy = new BigNumber(res.impliedApy || 0).times(ptUsd).div(totalUsd);
        baseApy = baseApy.plus(underlyingApy).plus(ptFixedApy);
        pendleApy = new BigNumber(res.pendleApy || 0);
        syRewardsApy = new BigNumber(res.lpRewardApy || 0);
      }
      tradingApys = { ...tradingApys, ...{ [pool.address.toLowerCase()]: baseApy } };
      pendleApys.push(pendleApy);
      syRewardsApys.push(syRewardsApy);
    });
  } catch (err) {
    console.error('Pendle apy error', err.message);
  }
  return { tradingApys, pendleApys, syRewardsApys };
};

export const getPendleBaseApys = async (chainId, pools) => {
  const { tradingApys } = await getPendleApys(chainId, pools);
  return tradingApys;
};
