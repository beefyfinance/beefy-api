import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import pools from '../../../data/ethereum/conicPools.json';

export const getConicApys = async () => {
  const aprs = [];
  const tradingAprs = {};
  let conicApys = [];
  try {
    conicApys = (await fetch('https://yields.llama.fi/pools').then(res => res.json())).data.filter(
      p => p.project === 'conic-finance' && p.chain === 'Ethereum'
    );
  } catch (e) {
    console.error('Conic llama apys failed', e.message);
  }

  for (const pool of pools) {
    const conicApy = conicApys.find(p => p.symbol === pool.underlying.toUpperCase());
    if (conicApy) {
      aprs.push(new BigNumber(conicApy.apyReward).div(100));
      tradingAprs[pool.address.toLowerCase()] = new BigNumber(conicApy.apyBase).div(100);
    } else {
      aprs.push(new BigNumber(0));
      tradingAprs[pool.address.toLowerCase()] = new BigNumber(0);
    }
  }

  return getApyBreakdown(pools, tradingAprs, aprs, 0);
};
