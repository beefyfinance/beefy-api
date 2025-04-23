import BigNumber from 'bignumber.js';
import {
  ARBITRUM_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../../constants';
import { fetchContract } from '../../rpc/client';
import { fetchPrice } from '../../../utils/fetchPrice';
import { parseAbi } from 'viem';
import { getPendleApys } from './getPendleBaseApys';
import { getApyBreakdown } from './getApyBreakdownNew';

const PENDLE = {
  [ARBITRUM_CHAIN_ID]: '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8',
  [ETH_CHAIN_ID]: '0x808507121B80c02388fAd14726482e061B8da827',
  [BSC_CHAIN_ID]: '0xb3Ed0A426155B79B898849803E3B36552f7ED507',
  [BASE_CHAIN_ID]: '0xa99f6e6785da0f5d6fb42495fe424bce029eeb3e',
  [SONIC_CHAIN_ID]: '0xf1ef7d2d4c0c881cd634481e0586ed5d2871a74b',
};
const eqbPendleProxy = {
  [ETH_CHAIN_ID]: '0x64627901dAdb46eD7f275fD4FC87d086cfF1e6E3',
  [SONIC_CHAIN_ID]: '0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d',
};

export async function getEquilibriaApys(allPools) {
  const chainId = allPools[0].chainId;
  const pools = allPools.filter(p => p.eqbGauge);
  const { tradingApys, pendleApys, syRewardsApys } = await getPendleApys(chainId, pools);
  const eqbApys = await getPoolApys(chainId, pools, syRewardsApys);

  // pools.forEach((p, i) => {
  //   console.log(p.name,'eqb-apy',(eqbApys[p.address] || 0).toString(10),'pendle-apy',pendleApys[i].plus(syRewardsApys[i]).toString(10));
  // });

  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name.replace('pendle-', 'pendle-eqb-'),
      vault: BigNumber.max(eqbApys[p.address] || 0, pendleApys[i].plus(syRewardsApys[i])),
      trading: tradingApys[p.address.toLowerCase()],
    }))
  );
}

const abi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function rewards(address token) view returns (uint periodFinish, uint rewardRate)',
  'function expiry() view returns (uint)',
  'function balanceOf(address) view returns (uint256)',
  'function activeBalance(address) view returns (uint256)',
]);

const getPoolApys = async (chainId, pools, syRewardsApys) => {
  const apys = {};

  const pendleProxy = eqbPendleProxy[chainId];
  const totalSupplyCalls = [],
    expiryCalls = [],
    balancesCalls = [],
    activeBalancesCalls = [],
    extraRewardInfo = [],
    extraRewardsCalls = [];
  pools.forEach(pool => {
    const lp = fetchContract(pool.address, abi, chainId);
    expiryCalls.push(lp.read.expiry());
    if (pendleProxy) {
      balancesCalls.push(lp.read.balanceOf([pendleProxy]).then(v => new BigNumber(v)));
      activeBalancesCalls.push(lp.read.activeBalance([pendleProxy]).then(v => new BigNumber(v)));
    }
    const rewardPool = fetchContract(pool.eqbGauge, abi, chainId);
    totalSupplyCalls.push(rewardPool.read.totalSupply());
    extraRewardInfo.push({ pool: pool.name, token: PENDLE[chainId], oracle: 'tokens', oracleId: 'PENDLE' });
    extraRewardsCalls.push(rewardPool.read.rewards([PENDLE[chainId]]));
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
    Promise.all(balancesCalls),
    Promise.all(activeBalancesCalls),
  ]);

  const poolInfo = res[0].map((_, i) => ({
    totalSupply: new BigNumber(res[0][i]),
    expiry: new BigNumber(res[2][i]),
    boost: pendleProxy ? (res[3][i].isZero() ? 2.5 : res[4][i].div(res[3][i]).times(2.5)) : 2.5,
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
      apys[pool.address] = new BigNumber(0);
      continue;
    }

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice).div('1e18');
    let yearlyRewardsInUsd = new BigNumber(0);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const price = await fetchPrice({ oracle: extra.oracle, id: extra.oracleId });
      const extraRewardsInUsd = extra.rewardRate.times(31536000).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
      // console.log(pool.name, extra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    apys[pool.address] = yearlyRewardsInUsd.div(totalStakedInUsd);

    // USUAL is boosted by Eqb but claimed via merkl (not included in extras)
    if (pool.eqbExternalSy) {
      apys[pool.address] = apys[pool.address].plus(syRewardsApys[i].times(info.boost));
    }

    // console.log(pool.name, apys[pool.address].valueOf(), yearlyRewardsInUsd.valueOf(), totalStakedInUsd.valueOf());
  }
  return apys;
};
