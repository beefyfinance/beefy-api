import BigNumber from 'bignumber.js';
import { BASE_CHAIN_ID as chainId } from '../../../constants';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import fetchPrice from '../../../utils/fetchPrice';
import ERC20Abi from '../../../abis/ERC20Abi';
import IRewardPool from '../../../abis/IRewardPool';
import { fetchContract } from '../../rpc/client';

const pools = require('../../../data/base/swapBasedLpPools.json');

export const getSwapBasedApys = async (): Promise<ApyBreakdownResult> => {
  const [farmApys] = await Promise.all([getFarmApys()]);

  const liquidityProviderFee = 0.003;

  return getApyBreakdown(pools, {}, farmApys, liquidityProviderFee);
};

const getFarmApys = async (): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const [{ balances, rewardRates }] = await Promise.all([getPoolsData()]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: 'BASE' });
    const rewardInUsd = new BigNumber(rewardRates[i].toString())
      .dividedBy('1e18')
      .times(rewardPrice)
      .times(0.98) // reward fee
      .times(0.6); // 0.2 + (0.8 / 2) : BASE + xBASE reward

    const secondsPerYear = 31536000;
    const yearlyRewardsInUsd = rewardInUsd.times(secondsPerYear).times(0.99); // deposit fee

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }

  return apys;
};

const getPoolsData = async () => {
  const balanceCalls = [];
  const rewardRateCalls = [];

  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, chainId);
    const rewardPoolContract = fetchContract(pool.strat, IRewardPool, chainId);
    balanceCalls.push(tokenContract.read.balanceOf([pool.strat]));
    rewardRateCalls.push(rewardPoolContract.read.rewardRate());
  });

  const [balanceResults, rewardRateResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map(v => new BigNumber(v.toString()));
  const rewardRates: BigNumber[] = rewardRateResults.map(v => new BigNumber(v.toString()));
  return { balances, rewardRates };
};
