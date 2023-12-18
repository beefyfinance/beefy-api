import BigNumber from 'bignumber.js';

export const getPendleBaseApys = async (chainId, pools) => {
  let apys = {};
  try {
    const response = await fetch(
      `https://api-v2.pendle.finance/core/v1/${chainId}/markets?limit=100&is_active=true`
    ).then(res => res.json());
    pools.forEach(pool => {
      let apy = new BigNumber(0);
      const res = response.results.find(
        r => r.address.toLowerCase() === pool.address.toLowerCase()
      );
      if (res) {
        apy = new BigNumber(res.swapFeeApy || 0);
        const ptUsd = res.totalPt * res.pt?.price?.usd || 0;
        const syUsd = res.totalSy * res.sy?.price?.usd || 0;
        const totalUsd = res.liquidity?.usd || 1;
        const underlyingApy = new BigNumber(res.underlyingInterestApy || 0)
          .times(syUsd)
          .div(totalUsd);
        const ptFixedApy = new BigNumber(res.impliedApy || 0).times(ptUsd).div(totalUsd);
        // console.log(pool.name, 'lp', ptUsd, syUsd, totalUsd);
        // console.log(pool.name, 'underlying APY', underlyingApy.toNumber());
        // console.log(pool.name, 'ptFixed APY', ptFixedApy.toNumber());
        apy = apy.plus(underlyingApy).plus(ptFixedApy);
      }
      apys = { ...apys, ...{ [pool.address.toLowerCase()]: apy } };
    });
  } catch (err) {
    console.error('Pendle base apy error', err.message);
  }
  return apys;
};
