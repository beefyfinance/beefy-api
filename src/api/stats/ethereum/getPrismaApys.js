import { ETH_CHAIN_ID, ETHEREUM_VAULTS_ENDPOINT } from '../../../constants';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';
import { fetchContract } from '../../rpc/client';
import { parseAbi } from 'viem';

const pools = require('../../../data/ethereum/convexPools.json').filter(
  p => p.prismaCurvePool || p.prismaConvexPool
);
const subgraphUrl = 'https://api.curve.fi/api/getSubgraphData/ethereum';
const tradingFees = 0.0002;
const secondsPerYear = 31536000;

export const getPrismaApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(pools, subgraphUrl),
    getPoolApys(pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const prismaAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function periodFinish() view returns (uint32)',
  'function rewardRate(uint index) view returns (uint128)',
]);

const getPoolApys = async pools => {
  const apys = [];

  const poolsInfo = [],
    totalSupplyCalls = [],
    periodFinishCalls = [];
  const extraRewardInfo = [],
    extraRewardRateCalls = [];
  pools.forEach(pool => {
    const prismaRewards = {};
    if (pool.prismaCurvePool) {
      prismaRewards[pool.prismaCurvePool] = ['PRISMA', 'CRV'];
    }
    if (pool.prismaConvexPool) {
      prismaRewards[pool.prismaConvexPool] = ['PRISMA', 'CRV', 'CVX'];
    }
    for (const prismaPool of Object.keys(prismaRewards)) {
      const rewardPool = fetchContract(prismaPool, prismaAbi, ETH_CHAIN_ID);
      poolsInfo.push({ name: pool.name, prisma: prismaPool });
      totalSupplyCalls.push(rewardPool.read.totalSupply());
      periodFinishCalls.push(rewardPool.read.periodFinish());
      prismaRewards[prismaPool].forEach((token, i) => {
        extraRewardInfo.push({ pool: pool.name, prisma: prismaPool, oracleId: token });
        extraRewardRateCalls.push(rewardPool.read.rewardRate([i]));
      });
    }
  });

  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(periodFinishCalls),
    Promise.all(extraRewardRateCalls),
  ]);
  const poolInfo = res[0].map((_, i) => ({
    ...poolsInfo[i],
    totalSupply: new BigNumber(res[0][i].toString()),
    periodFinish: new BigNumber(res[1][i].toString()),
  }));
  const extras = extraRewardInfo.map((_, i) => ({
    ...extraRewardInfo[i],
    rewardRate: new BigNumber(res[2][i].toString()),
  }));

  for (let i = 0; i < poolInfo.length; i++) {
    const info = poolInfo[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: info.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice).div('1e18');
    let yearlyRewardsInUsd = new BigNumber(0);

    if (info.periodFinish > Date.now() / 1000) {
      for (const extra of extras.filter(e => e.pool === info.name && e.prisma === info.prisma)) {
        const price = await fetchPrice({ oracle: extra.oracle ?? 'tokens', id: extra.oracleId });
        const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price).div('1e18');
        yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
        // console.log(info.name, extra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
      }
    }
    info.apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    // console.log(info.name, info.apy.valueOf(), totalStakedInUsd.valueOf());
  }

  pools.forEach(pool => {
    const poolApys = poolInfo.filter(p => p.name === pool.name).map(p => p.apy);
    const maxApy = BigNumber.max.apply(null, poolApys);
    // console.log(pool.name, 'max', maxApy.valueOf());
    apys.push(maxApy);
  });

  if (process.env.CHECK_PRISMA) {
    checkVaultsApys(pools, poolInfo).catch(e =>
      console.error('> check prisma vaults apy error', e.message)
    );
  }

  return apys;
};

async function checkVaultsApys(pools, infos) {
  const allVault = await fetch(ETHEREUM_VAULTS_ENDPOINT).then(res => res.json());
  const prismaVaults = allVault.filter(v => v.platformId === 'prisma');

  const abi = parseAbi([
    'function strategy() view returns (address)',
    'function rewardPool() view returns (address)',
  ]);
  const strats = await Promise.all(
    prismaVaults.map(v => fetchContract(v.earnContractAddress, abi, ETH_CHAIN_ID).read.strategy())
  );
  const rewardPools = await Promise.all(
    strats.map(s => fetchContract(s, abi, ETH_CHAIN_ID).read.rewardPool())
  );

  prismaVaults.forEach((v, i) => {
    const poolApys = infos.filter(p => p.name === v.id);
    const currentApy = poolApys.find(p => p.prisma === rewardPools[i]).apy;
    const betterPool = poolApys.find(p => p.apy.gt(currentApy));
    if (betterPool) {
      const pool = pools.find(p => p.name === betterPool.name);
      const type = pool?.prismaConvexPool === betterPool.prisma ? 'Convex' : 'Curve';
      console.log(
        `${v.id} better APY: ${currentApy} vs ${betterPool.apy}, new ${type} rewardPool: ${betterPool.prisma}`
      );
    }
  });
}
