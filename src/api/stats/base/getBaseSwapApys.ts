import BigNumber from 'bignumber.js';
import { BASE_CHAIN_ID as chainId } from '../../../constants';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import fetchPrice from '../../../utils/fetchPrice';
import { fetchContract } from '../../rpc/client';
import BaseSwapMasterChef from '../../../abis/base/BaseSwapMasterChef';
import BaseSwapNFT from '../../../abis/base/BaseSwapNFT';
import pools from '../../../data/base/baseSwapLpPools.json';

const masterchef = '0x6Fc0f134a1F20976377b259687b1C15a5d422B47';

const getBaseSwapApys = async (): Promise<ApyBreakdownResult> => {
  const farmApys = await getFarmApys();
  return getApyBreakdown(pools, {}, farmApys, 0.003);
};

const getFarmApys = async (): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const bsxTokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BSX' });
  const bswapTokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BSWAP' });

  const [{ bsxRewards, bswapRewards }, { balances, xShare }] = await Promise.all([
    getMasterChefData(),
    getPoolsData(),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = 'lps';
    const id = pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    // 50% of xToken rewards can be redeemed
    const liquidShare = new BigNumber(10000).minus(xShare[i].dividedBy(2)).dividedBy(10000);

    const yearlyBsxRewards = bsxRewards[i].times(liquidShare).times(secondsPerYear);
    const yearlyBswapRewards = bswapRewards[i].times(secondsPerYear);
    const yearlyBsxRewardsInUsd = yearlyBsxRewards.times(bsxTokenPrice).dividedBy('1e18');
    const yearlyBswapRewardsInUsd = yearlyBswapRewards.times(bswapTokenPrice).dividedBy('1e18');

    let yearlyRewardsInUsd = yearlyBsxRewardsInUsd.plus(yearlyBswapRewardsInUsd);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, BaseSwapMasterChef, chainId);
  const masterCalls = [];
  pools.forEach(pool => {
    masterCalls.push(masterchefContract.read.getPoolInfo([pool.rewardPool as `0x${string}`]));
  });

  const masterResults = await Promise.all(masterCalls);

  const bsxRewards: BigNumber[] = masterResults.map(v => new BigNumber(v[6].toString()));
  const bswapRewards: BigNumber[] = masterResults.map(v => new BigNumber(v[7].toString()));

  return { bsxRewards, bswapRewards };
};

const getPoolsData = async () => {
  const balanceCalls = [];
  const xShareCalls = [];
  pools.forEach(pool => {
    const poolContract = fetchContract(pool.rewardPool, BaseSwapNFT, chainId);
    balanceCalls.push(poolContract.read.getPoolInfo());
    xShareCalls.push(poolContract.read.xTokenRewardsShare());
  });

  const [balanceResults, xShareResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(xShareCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map(v => new BigNumber(v[7].toString()));
  const xShare: BigNumber[] = xShareResults.map(v => new BigNumber(v.toString()));
  return { balances, xShare };
};

module.exports = getBaseSwapApys;
