import { fetchContract } from '../../rpc/client';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';
import { parseAbi } from 'viem';
import { getPendleApys } from '../common/getPendleBaseApys';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { BSC_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/bsc/pendlePools.json';

export async function getEquilibriaApys() {
  const eqbPools = pools.filter(p => p.eqbGauge);
  const eqbApys = await getPoolApys(chainId, eqbPools);
  let { tradingApys, pendleApys } = await getPendleApys(chainId, pools);

  // pools.forEach(((p,i) => {
  //   console.log(p.name, 'eqb-apy', (eqbApys[p.address] || 0).toString(10), 'pendle-apy', pendleApys[i].toString(10))
  // }));

  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name.replace('pendle-', 'pendle-eqb-'),
      vault: BigNumber.max(eqbApys[p.address] || 0, pendleApys[i]),
      trading: tradingApys[p.address.toLowerCase()],
    }))
  );
}

const PENDLE = '0xb3Ed0A426155B79B898849803E3B36552f7ED507';
const equilibriaAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function rewards(address token) view returns (uint periodFinish, uint rewardRate)',
  'function expiry() view returns (uint)',
]);

const getPoolApys = async (chainId, pools) => {
  const apys = {};
  const totalSupplyCalls = [],
    expiryCalls = [],
    extraRewardInfo = [],
    extraRewardsCalls = [];
  pools.forEach(pool => {
    expiryCalls.push(fetchContract(pool.address, equilibriaAbi, chainId).read.expiry());
    const rewardPool = fetchContract(pool.eqbGauge, equilibriaAbi, chainId);
    totalSupplyCalls.push(rewardPool.read.totalSupply());
    extraRewardInfo.push({ pool: pool.name, token: PENDLE, oracle: 'tokens', oracleId: 'PENDLE' });
    extraRewardsCalls.push(rewardPool.read.rewards([PENDLE]));
    pool.rewards?.forEach(extra => {
      extraRewardInfo.push({
        pool: pool.name,
        token: extra.token,
        oracle: extra.oracle ?? 'tokens',
        oracleId: extra.oracleId,
      });
      extraRewardsCalls.push(rewardPool.read.rewards([extra.token]));
    });
  });

  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(extraRewardsCalls),
    Promise.all(expiryCalls),
  ]);

  const poolInfo = res[0].map((_, i) => ({
    totalSupply: new BigNumber(res[0][i]),
    expiry: new BigNumber(res[2][i]),
  }));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[1][i]['1']),
    periodFinish: new BigNumber(res[1][i]['0']),
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    if (info.expiry < Date.now() / 1000) {
      apys.push(new BigNumber(0));
      continue;
    }

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice).div('1e18');
    let yearlyRewardsInUsd = new BigNumber(0);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      const price = await fetchPrice({ oracle: extra.oracle, id: extra.oracleId });
      if (extra.periodFinish < Date.now() / 1000) continue;
      const extraRewardsInUsd = extra.rewardRate.times(31536000).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
      // console.log(pool.name, extra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys[pool.address] = apy;

    // console.log(pool.name, apy.valueOf(), yearlyRewardsInUsd.valueOf(), totalStakedInUsd.valueOf());
  }
  return apys;
};
