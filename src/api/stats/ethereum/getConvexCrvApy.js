import { MultiCall } from 'eth-multicall';
import { ethereumWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import { getContract } from '../../../utils/contractHelper';
import IRewardPool from '../../../abis/IRewardPool.json';
import ICvxCrvStaking from '../../../abis/ethereum/ICvxCrvStaking.json';
import IERC20 from '../../../abis/ERC20.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import { getMintedCvxAmount } from './getConvexApys';

const secondsPerYear = 31536000;
const cvxAddress = '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B';

const pool = {
  name: 'convex-staked-cvxCRV',
  staking: '0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434',
  cvxDistributor: '0x449f2fd99174e1785CF2A1c79E665Fec3dD1DdC6',
  rewardPool: '0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e',
  extras: [
    {
      rewardPool: '0x7091dbb7fcbA54569eF1387Ac89Eb2a5C9F6d2EA',
      oracle: 'lps',
      oracleId: 'convex-3pool',
    },
  ],
};

export const getConvexCrvApy = async () => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rewardPoolCalls = [];
  const extraRewardCalls = [];
  const cvxCalls = [];
  const stakingCalls = [];
  const cvxDistrCalls = [];

  const rewardPool = getContract(IRewardPool, pool.rewardPool);
  rewardPoolCalls.push({
    totalSupply: rewardPool.methods.totalSupply(),
    rewardRate: rewardPool.methods.rewardRate(),
    periodFinish: rewardPool.methods.periodFinish(),
  });
  pool.extras?.forEach(extra => {
    const extraRewards = getContract(IRewardPool, extra.rewardPool);
    extraRewardCalls.push({
      rewardPool: extra.rewardPool,
      rewardRate: extraRewards.methods.rewardRate(),
      periodFinish: extraRewards.methods.periodFinish(),
    });
  });
  const stakingContract = getContract(ICvxCrvStaking, pool.staking);
  stakingCalls.push({
    supplyWeight: stakingContract.methods.supplyWeight(),
    totalSupply: stakingContract.methods.totalSupply(),
  });
  const cvx = getContract(IERC20, cvxAddress);
  cvxCalls.push({
    cvxSupply: cvx.methods.totalSupply(),
  });
  const cvxDistributor = getContract(IRewardPool, pool.cvxDistributor);
  cvxDistrCalls.push({
    rewardRate: cvxDistributor.methods.rewardRate(),
    periodFinish: cvxDistributor.methods.periodFinish(),
    totalSupply: cvxDistributor.methods.totalSupply(),
    balanceOf: cvxDistributor.methods.balanceOf(pool.staking),
  });

  const res = await multicall.all([
    rewardPoolCalls,
    extraRewardCalls,
    stakingCalls,
    cvxCalls,
    cvxDistrCalls,
  ]);
  const poolInfo = res[0].map(v => ({
    totalSupply: new BigNumber(v.totalSupply),
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
  }))[0];
  const extras = res[1].map(v => ({
    ...v,
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
  }));
  const info = {
    ...poolInfo,
    supplyWeight: new BigNumber(res[2][0].supplyWeight),
    stakingTotalSupply: new BigNumber(res[2][0].totalSupply),
    cvxSupply: new BigNumber(res[3][0].cvxSupply),
  };
  const cvxDistRewards = res[4].map(v => ({
    rewardRate: new BigNumber(v.rewardRate),
    periodFinish: v.periodFinish,
    totalSupply: new BigNumber(v.totalSupply),
    balanceOf: new BigNumber(v.balanceOf),
  }))[0];

  const cvxPrice = await fetchPrice({ oracle: 'tokens', id: 'CVX' });
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  const crvRewards = info.rewardRate.times(secondsPerYear);
  const crvRewardsInUsd = crvRewards.times(crvPrice).div('1e18');

  const cvxRewards = getMintedCvxAmount(crvRewards, info.cvxSupply);
  const cvxRewardsInUsd = cvxRewards.times(cvxPrice).div('1e18');

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxCRV' });
  const totalStakedInUsd = info.totalSupply.times(tokenPrice).div('1e18');

  const group0Ratio = info.stakingTotalSupply.div(info.stakingTotalSupply.minus(info.supplyWeight));

  let group0Apy = crvRewardsInUsd
    .plus(cvxRewardsInUsd)
    .div(totalStakedInUsd)
    .times(group0Ratio)
    .toNumber();
  // console.log(pool.name, 'group0 apy', group0Apy);

  const cvxDistApy = cvxDistRewards.rewardRate
    .times(secondsPerYear)
    .times(cvxPrice)
    .times(cvxDistRewards.balanceOf)
    .div(cvxDistRewards.totalSupply)
    .div(info.stakingTotalSupply.times(tokenPrice))
    .times(group0Ratio)
    .toNumber();
  group0Apy += cvxDistApy;
  // console.log(pool.name, 'group0 apy', 'cvx dist', group0Apy);

  let group1Apy = 0;
  for (const extra of extras) {
    if (extra.periodFinish < Date.now() / 1000) continue;
    const poolExtra = pool.extras.find(e => e.rewardPool === extra.rewardPool);
    const price = await fetchPrice({
      oracle: poolExtra.oracle ?? 'tokens',
      id: poolExtra.oracleId,
    });
    const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price).div('1e18');
    group1Apy += extraRewardsInUsd
      .div(totalStakedInUsd)
      .times(info.stakingTotalSupply)
      .div(info.supplyWeight)
      .toNumber();
    // console.log(pool.name, 'group1 apy', poolExtra.oracleId, group1Apy);
  }
  const apy = Math.max(group0Apy, group1Apy);
  return { [pool.name]: apy };
};
