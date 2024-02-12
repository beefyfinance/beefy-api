import { ARBITRUM_CHAIN_ID, ETH_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import { fetchPrice } from '../../../utils/fetchPrice';
import { parseAbi } from 'viem';
import { getPendleBaseApys } from './getPendleBaseApys';

export const getEquilibriaApys = async pools => {
  const chainId = pools[0].chainId;
  const tradingAprs = await getPendleBaseApys(chainId, pools);
  const farmApys = await getPoolApys(chainId, pools);
  return getApyBreakdown(pools, tradingAprs, farmApys);
};

const eqbMinter = {
  [ARBITRUM_CHAIN_ID]: '0x09bae4C38B1a9142726C6F08DC4d1260B0C8e94d',
  [ETH_CHAIN_ID]: '0x52f0Bbe0325097ac93e1EC85c32A950E47789Ca5',
};

const equilibriaAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function rewards(address token) view returns (uint periodFinish, uint rewardRate)',
  'function getFactor() view returns (uint)',
]);

const getPoolApys = async (chainId, pools) => {
  const apys = [];
  const totalSupplyCalls = [];
  const extraRewardInfo = [],
    extraRewardsCalls = [];
  pools.forEach(pool => {
    const rewardPool = fetchContract(pool.gauge, equilibriaAbi, chainId);
    totalSupplyCalls.push(rewardPool.read.totalSupply());
    pool.rewards?.forEach(extra => {
      extraRewardInfo.push({ pool: pool.name, token: extra.token });
      extraRewardsCalls.push(rewardPool.read.rewards([extra.token]));
    });
  });
  const eqbFactorCall = fetchContract(eqbMinter[chainId], equilibriaAbi, chainId).read.getFactor();

  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(extraRewardsCalls),
    eqbFactorCall,
  ]);
  const arbApys = await getEqbArbApy(chainId);

  const poolInfo = res[0].map((_, i) => ({
    totalSupply: new BigNumber(res[0][i].toString()),
  }));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[1][i]['1'].toString()),
    periodFinish: new BigNumber(res[1][i]['0'].toString()),
  }));
  const eqbFactor = new BigNumber(res[2].toString()).div(10000);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice).div('1e18');
    let yearlyRewardsInUsd = new BigNumber(0);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      const poolExtra = pool.rewards.find(e => e.token === extra.token);
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate.times(31536000).times(price).div('1e18');
      if (poolExtra.oracleId === 'ARB') {
        const poolArbApy =
          extra.periodFinish < Date.now() / 1000
            ? new BigNumber(0)
            : extraRewardsInUsd.div(totalStakedInUsd);
        const eqbArbApy = arbApys[pool.address] || 0;
        if (poolArbApy.gt(eqbArbApy)) {
          yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
        } else {
          yearlyRewardsInUsd = yearlyRewardsInUsd.plus(totalStakedInUsd.times(eqbArbApy));
        }
      } else {
        if (extra.periodFinish < Date.now() / 1000) continue;
        yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
      }
      // console.log(pool.name, poolExtra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());

      if (poolExtra.oracleId === 'PENDLE') {
        const eqbPrice = await fetchPrice({ oracle: 'tokens', id: 'EQB' });
        const extraRewardsInUsd = extra.rewardRate
          .times(eqbFactor)
          .times(31536000)
          .times(eqbPrice)
          .div('1e18');
        yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
        // console.log(pool.name, 'EQB', extraRewardsInUsd.div(totalStakedInUsd).valueOf());
      }
    }
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);

    // console.log(pool.name, apy.valueOf(), yearlyRewardsInUsd.valueOf(), totalStakedInUsd.valueOf());
  }
  return apys;
};

async function getEqbArbApy(chainId) {
  let apys = {};
  try {
    const response = await fetch('https://equilibria.fi/api/chain-info').then(res => res.json());
    const pools = response[chainId].poolInfos;
    pools.forEach(p => (apys[p.market] = new BigNumber(p.arbApy || 0)));
  } catch (err) {
    console.error('getEqbArbApy error', err.message);
  }
  return apys;
}
