import BigNumber from 'bignumber.js';

export const getPendleApys = async (chainId, pools) => {
  let tradingApys = {};
  const pendleApys = [];
  const syRewardsApys = [];
  const arbApys = [];
  try {
    const response = await fetch(
      `https://api-v2.pendle.finance/core/v1/${chainId}/markets?limit=100&is_active=true`
    ).then(res => res.json());
    pools.forEach(pool => {
      let baseApy = new BigNumber(0);
      const res = response.results.find(r => r.address.toLowerCase() === pool.address.toLowerCase());
      if (res) {
        baseApy = new BigNumber(res.swapFeeApy || 0);
        const ptUsd = res.totalPt * res.pt?.price?.usd || 0;
        const syUsd = res.totalSy * res.sy?.price?.usd || 0;
        const totalUsd = res.liquidity?.usd || 1;
        const underlyingApy = new BigNumber(res.underlyingInterestApy || 0).times(syUsd).div(totalUsd);
        const ptFixedApy = new BigNumber(res.impliedApy || 0).times(ptUsd).div(totalUsd);
        baseApy = baseApy.plus(underlyingApy).plus(ptFixedApy);
      }
      tradingApys = { ...tradingApys, ...{ [pool.address.toLowerCase()]: baseApy } };
      pendleApys.push(new BigNumber(res?.pendleApy || 0));
      syRewardsApys.push(new BigNumber(res?.lpRewardApy || 0));
      arbApys.push(new BigNumber(res?.arbApy || 0));
    });
  } catch (err) {
    console.error('Pendle apy error', err.message);
  }
  return { tradingApys, pendleApys, syRewardsApys, arbApys };
};
