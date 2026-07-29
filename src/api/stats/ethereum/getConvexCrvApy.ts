import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import ICvxCrvStaking from '../../../abis/ethereum/ICvxCrvStaking.ts';
import IRewardPool from '../../../abis/IRewardPool.ts';
import { ETH_CHAIN_ID } from '../../../constants.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';
import { getMintedCvxAmount } from './getConvexApys.ts';

const secondsPerYear = 31536000;
const cvxAddress = '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B';

type CvxCrvExtraReward = {
  rewardPool: string;
  oracle?: string;
  oracleId: string;
};

type CvxCrvExtraRewardInfo = {
  rewardPool: string;
};

const pool = {
  name: 'convex-staked-cvxCRV',
  staking: '0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434',
  cvxDistributor: '0x449f2fd99174e1785CF2A1c79E665Fec3dD1DdC6',
  rewardPool: '0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e',
  extras: [
    {
      rewardPool: '0x191F455cc8acdd579f4E6956fC7007c9668C2289',
      oracle: 'tokens',
      oracleId: 'crvUSD',
    },
  ],
};

export const getConvexCrvApy = async () => {
  // RewardPool calls
  const rewardPool = fetchContract(pool.rewardPool, IRewardPool, ETH_CHAIN_ID);
  const totalSupplyCall = rewardPool.read.totalSupply();
  const rewardRateCall = rewardPool.read.rewardRate();
  const periodFinishCall = rewardPool.read.periodFinish();

  //extra reward calls
  const extraRewardInfo: CvxCrvExtraRewardInfo[] = [],
    extraRewardRateCalls: Promise<bigint>[] = [],
    extraRewardRatePeriodFinishCalls: Promise<bigint>[] = [];
  pool.extras?.forEach(extra => {
    const extraRewards = fetchContract(extra.rewardPool, IRewardPool, ETH_CHAIN_ID);
    extraRewardInfo.push({ rewardPool: extra.rewardPool });
    extraRewardRateCalls.push(extraRewards.read.rewardRate());
    extraRewardRatePeriodFinishCalls.push(extraRewards.read.periodFinish());
  });

  //staking contract calls
  const stakingContract = fetchContract(pool.staking, ICvxCrvStaking, ETH_CHAIN_ID);
  const supplyWeightCall = stakingContract.read.supplyWeight();
  const stakingTotalSupplyCall = stakingContract.read.totalSupply();

  //CVX calls
  const cvx = fetchContract(cvxAddress, ERC20Abi, ETH_CHAIN_ID);
  const cvxTotalSupply = cvx.read.totalSupply();

  //Distributor calls
  const cvxDistributor = fetchContract(pool.cvxDistributor, IRewardPool, ETH_CHAIN_ID);
  const cvxDistributorRewardRateCall = cvxDistributor.read.rewardRate();
  const cvxDistributorPeriodFinishCall = cvxDistributor.read.periodFinish();
  const cvxDistributorTotalSupplyCall = cvxDistributor.read.totalSupply();
  const cvxDistributorBalanceOfCall = cvxDistributor.read.balanceOf([pool.staking as Address]);

  const res = await Promise.all([
    totalSupplyCall,
    rewardRateCall,
    periodFinishCall,
    Promise.all(extraRewardRateCalls),
    Promise.all(extraRewardRatePeriodFinishCalls),
    supplyWeightCall,
    stakingTotalSupplyCall,
    cvxTotalSupply,
    cvxDistributorRewardRateCall,
    cvxDistributorPeriodFinishCall,
    cvxDistributorTotalSupplyCall,
    cvxDistributorBalanceOfCall,
  ]);

  const poolInfo = {
    totalSupply: new BigNumber(res[0]),
    rewardRate: new BigNumber(res[1]),
    periodFinish: new BigNumber(res[2]),
  };
  const extras = extraRewardInfo.map((_, index) => ({
    ...extraRewardInfo[index],
    rewardRate: new BigNumber(res[3][index]),
    periodFinish: new BigNumber(res[4][index]),
  }));
  const info = {
    ...poolInfo,
    supplyWeight: new BigNumber(res[5]),
    stakingTotalSupply: new BigNumber(res[6]),
    cvxSupply: new BigNumber(res[7]),
  };
  const cvxDistRewards = {
    rewardRate: new BigNumber(res[8]),
    periodFinish: new BigNumber(res[9]),
    totalSupply: new BigNumber(res[10]),
    balanceOf: new BigNumber(res[11]),
  };

  const cvxPrice = await fetchPrice({ oracle: 'tokens', id: 'CVX' });
  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });

  const crvRewards = info.rewardRate.times(secondsPerYear);
  const crvRewardsInUsd = crvRewards.times(crvPrice).div('1e18');

  const cvxRewards = getMintedCvxAmount(crvRewards, info.cvxSupply);
  const cvxRewardsInUsd = cvxRewards.times(cvxPrice).div('1e18');

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'cvxCRV' });
  const totalStakedInUsd = info.totalSupply.times(tokenPrice).div('1e18');

  const group0Ratio = info.stakingTotalSupply.div(info.stakingTotalSupply.minus(info.supplyWeight));

  let group0Apy = crvRewardsInUsd.plus(cvxRewardsInUsd).div(totalStakedInUsd).times(group0Ratio).toNumber();
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
    if (extra.periodFinish.lt(Date.now() / 1000)) continue;
    // FIXME(unsafe-cast): may be undefined
    const poolExtra = pool.extras.find(e => e.rewardPool === extra.rewardPool) as CvxCrvExtraReward;
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
  const apr = Math.max(group0Apy, group1Apy);
  return getApyBreakdown([{ name: pool.name, address: pool.name }], {}, [new BigNumber(apr)], 0);
};
