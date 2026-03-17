import { getApyBreakdown } from '../common/getApyBreakdownNew';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';

const pools = require('../../../data/ethereum/convexPools.json').filter(p => p.stakeDao);
const secondsPerYear = 31536000;

export const getStakeDaoApys = async () => {
  const apys = [];
  try {
    const [res, merkles] = await Promise.all([
      fetch('https://api.stakedao.org/api/strategies/v2/curve/1.json').then(res => res.json()),
      fetch(
        'https://raw.githubusercontent.com/stake-dao/merkl-toolkit/refs/heads/main/data/incentives.json'
      ).then(res => res.json()),
    ]);
    for (const p of pools) {
      const apy = res.find(r => r.lpToken?.address?.toLowerCase() === (p.token || p.pool).toLowerCase());
      const trading = new BigNumber(apy?.tradingApy || 0).div(100);
      const curveTotal = new BigNumber(apy?.apr?.current?.total || 0).div(100);
      const merkle = await findMerkleApy(merkles, apy);
      const vault = curveTotal.minus(trading).plus(merkle);
      apys.push({ vault, trading });
    }
  } catch (e) {
    console.error('StakeDao json apy error', e.message);
  }
  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name.replace('curve-', 'stakedao-').replace('convex-', 'stakedao-'),
      vault: apys[i].vault,
      trading: apys[i].trading,
    }))
  );
};

async function findMerkleApy(merkles, sdStrat) {
  let apy = new BigNumber(0);
  if (!sdStrat) return apy;
  try {
    for (const m of merkles.filter(m => m.vault === sdStrat.vault && m.ended === false)) {
      const rewardPrice = (await fetchPrice({ oracle: 'tokens', id: m.rewardSymbol })) || 0;
      const rewardApy = new BigNumber(m.amount)
        .div(`1e${m.rewardDecimals}`)
        .div(m.duration)
        .times(secondsPerYear)
        .times(rewardPrice)
        .div(sdStrat.tvl);
      apy = apy.plus(rewardApy);
    }
  } catch (e) {
    console.error('StakeDao MerkleApy error', sdStrat.name, e);
  }
  return apy;
}
