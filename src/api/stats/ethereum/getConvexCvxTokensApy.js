import { ETH_CHAIN_ID } from '../../../constants.ts';
import { BigNumber } from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';
import ICvxFxsStaking from '../../../abis/ethereum/ICvxFxsStaking.ts';
import { fetchContract } from '../../rpc/client.ts';

const secondsPerYear = 31536000;

const pools = [
  {
    name: 'convex-staked-cvxFXN',
    oracleId: 'cvxFXN',
    address: '0xEC60Cd4a5866fb3B0DD317A46d3B474a24e06beF',
    rewards: [
      { address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', oracleId: 'CVX' },
      { address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', oracleId: 'wstETH' },
      { address: '0x365AccFCa291e7D3914637ABf1F7635dB165Bb09', oracleId: 'FXN' },
    ],
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
