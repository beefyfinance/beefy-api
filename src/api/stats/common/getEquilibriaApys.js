import BigNumber from 'bignumber.js';
import { ARBITRUM_CHAIN_ID, BASE_CHAIN_ID, BSC_CHAIN_ID, ETH_CHAIN_ID } from '../../../constants';
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
};
const eqbMinter = {
  [ARBITRUM_CHAIN_ID]: '0x09bae4C38B1a9142726C6F08DC4d1260B0C8e94d',
};

export async function getEquilibriaApys(pools) {
  const chainId = pools[0].chainId;
  const eqbPools = pools.filter(p => p.eqbGauge);
  const eqbApys = await getPoolApys(chainId, eqbPools);
  const { tradingApys, pendleApys, syRewardsApys } = await getPendleApys(chainId, pools);

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

const equilibriaAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function rewards(address token) view returns (uint periodFinish, uint rewardRate)',
  'function getFactor() view returns (uint)',
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
  const useEqbRewards = eqbMinter[chainId];
  const eqbFactorCall = useEqbRewards
    ? fetchContract(eqbMinter[chainId], equilibriaAbi, chainId).read.getFactor()
    : 0;

  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(extraRewardsCalls),
    Promise.all(expiryCalls),
    eqbFactorCall,
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
  const eqbFactor = new BigNumber(res[3]).div(10000);

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

      if (useEqbRewards && extra.oracleId === 'PENDLE') {
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
    apys[pool.address] = yearlyRewardsInUsd.div(totalStakedInUsd);
    // console.log(pool.name, apys[pool.address].valueOf(), yearlyRewardsInUsd.valueOf(), totalStakedInUsd.valueOf());
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
