import { ETH_CHAIN_ID } from '../../../constants';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import ICvxFxsStaking from '../../../abis/ethereum/ICvxFxsStaking';
import { fetchContract } from '../../rpc/client';

const secondsPerYear = 31536000;

const pools = [
  {
    name: 'convex-staked-cvxFXS',
    oracleId: 'cvxFXS',
    address: '0x49b4d1dF40442f0C31b1BbAEA3EDE7c38e37E31a',
    rewards: [
      { address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', oracleId: 'FXS' },
      { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' },
    ],
  },
  {
    name: 'convex-staked-cvxFPIS',
    oracleId: 'cvxFPIS',
    address: '0xfA87DB3EAa93B7293021e38416650D2E666bC483',
    rewards: [
      { address: '0xc2544A32872A91F4A553b404C6950e89De901fdb', oracleId: 'FPIS' },
      { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' },
    ],
  },
  {
    name: 'convex-staked-cvxPRISMA',
    oracleId: 'cvxPRISMA',
    address: '0x0c73f1cFd5C9dFc150C8707Aa47Acbd14F0BE108',
    rewards: [
      { address: '0xdA47862a83dac0c112BA89c6abC2159b95afd71C', oracleId: 'PRISMA' },
      { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' },
      { address: '0x4591dbff62656e7859afe5e45f6f47d3669fbb28', oracleId: 'mkUSD' },
    ],
  },
  {
    name: 'convex-staked-cvxFXN',
    oracleId: 'cvxFXN',
    address: '0xEC60Cd4a5866fb3B0DD317A46d3B474a24e06beF',
    rewards: [{ address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' }],
  },
];

export const getConvexCvxTokensApy = async () => {
  const rewardsInfo = [];
  const rewardDataCalls = [];
  const totalSupplyCalls = [];
  pools.forEach(pool => {
    const rewardPool = fetchContract(pool.address, ICvxFxsStaking, ETH_CHAIN_ID);
    totalSupplyCalls.push(rewardPool.read.totalSupply());
    pool.rewards?.forEach(r => {
      rewardsInfo.push({ pool: pool.name, oracleId: r.oracleId });
      rewardDataCalls.push(rewardPool.read.rewardData([r.address]));
    });
  });

  const res = await Promise.all([Promise.all(totalSupplyCalls), Promise.all(rewardDataCalls)]);

  const poolInfo = res[0].map((_, i) => ({
    totalSupply: new BigNumber(res[0][i].toString()),
  }));
  const rewards = rewardsInfo.map((_, i) => ({
    ...rewardsInfo[i],
    periodFinish: new BigNumber(res[1][i]['0'].toString()),
    rewardRate: new BigNumber(res[1][i]['1'].toString()),
  }));

  const apys = [];
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const tokenPrice = await fetchPrice({ oracle: 'tokens', id: pool.oracleId });
    const totalStakedInUsd = info.totalSupply.times(tokenPrice).div('1e18');
    let yearlyRewardsInUsd = new BigNumber(0);

    for (const r of rewards.filter(r => r.pool === pool.name)) {
      if (r.periodFinish < Date.now() / 1000) continue;
      const price = await fetchPrice({ oracle: 'tokens', id: r.oracleId });
      const extraRewardsInUsd = r.rewardRate.times(secondsPerYear).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
      // console.log(pool.name, r.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, apy.valueOf(), totalStakedInUsd.valueOf());
  }
  return getApyBreakdown(pools, {}, apys, 0);
};
