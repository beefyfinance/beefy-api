import { BigNumber } from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import convexPoolsData from '../../../data/ethereum/convexPools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'apy', platform: 'stakedao', chain: 'ethereum' });

const pools = convexPoolsData.filter(p => p.stakeDao);
const secondsPerYear = 31536000;

type StakeDaoStrategy = {
  name: string;
  vault: string;
  tvl: number;
  lpToken?: { address?: string };
  tradingApy?: number;
  apr?: { current?: { total?: number } };
};

type StakeDaoMerkleIncentive = {
  vault: string;
  ended: boolean;
  rewardSymbol: string;
  rewardDecimals: number;
  amount: string;
  duration: number;
};

type StakeDaoApr = {
  vault: BigNumber;
  trading: BigNumber;
};

export const getStakeDaoApys = async () => {
  const apys: StakeDaoApr[] = [];
  try {
    // const [res, merkles] = await Promise.all([
    //   fetch('https://api.stakedao.org/api/strategies/v2/curve/1.json').then(res => res.json()),
    //   fetch('https://raw.githubusercontent.com/stake-dao/merkl-toolkit/refs/heads/main/data/incentives.json').then(
    //     res => res.json()
    //   ),
    // ]);
    // FIXME(unsafe-cast): unchecked response shape
    const res = (await fetch('https://api.stakedao.org/api/strategies/v2/curve/1.json').then(res =>
      res.json()
    )) as StakeDaoStrategy[];
    for (const p of pools) {
      const apy = res.find(r => r.lpToken?.address?.toLowerCase() === (p.token || p.pool).toLowerCase());
      const trading = new BigNumber(apy?.tradingApy || 0).div(100);
      const curveTotal = new BigNumber(apy?.apr?.current?.total || 0).div(100);
      // const merkle = await findMerkleApy(merkles, apy);
      // const vault = curveTotal.minus(trading).plus(merkle);
      const vault = curveTotal.minus(trading);
      apys.push({ vault, trading });
    }
  } catch (e) {
    logger.warn({ err: e }, 'apy fetch failed');
  }
  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name.replace('curve-', 'stakedao-').replace('convex-', 'stakedao-'),
      vault: apys[i].vault,
      trading: apys[i].trading,
    }))
  );
};

async function findMerkleApy(merkles: StakeDaoMerkleIncentive[], sdStrat: StakeDaoStrategy | undefined) {
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
    logger.warn({ vault: sdStrat.name, err: e }, 'merkle apy calculation failed');
  }
  return apy;
}
