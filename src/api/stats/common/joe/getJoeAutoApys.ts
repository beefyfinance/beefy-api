import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../../packages/address-book/address-book';
import getApyBreakdown, { ApyBreakdownResult } from '../../common/getApyBreakdown';
import { LpPool } from '../../../../types/LpPool';
import { fetchPrice } from '../../../../utils/fetchPrice';
import { fetchContract } from '../../../rpc/client';
import ERC20Abi from '../../../../abis/ERC20Abi';
import abi from '../../../../abis/arbitrum/JoeAutoFarm';
import ISimpleRewarder from '../../../../abis/ISimpleRewarder';
const baseApyUrl = 'https://barn.traderjoexyz.com/v1/vaults';

type JoeVault = {
  address: string;
  apr1d: number;
};

type JoeVaultsResponse = JoeVault[];

export const getJoeAutoApys = async (joeAutoParams): Promise<ApyBreakdownResult> => {
  const tradingAprs = await getTradingAprs(joeAutoParams);
  const farmApys = await getFarmApys(joeAutoParams);
  const providerFee = joeAutoParams.pools.map(pool => new BigNumber(pool.tradingFee ?? 0));

  return getApyBreakdown(joeAutoParams.pools, tradingAprs, farmApys, providerFee);
};

const getTradingAprs = async (params): Promise<Record<string, BigNumber>> => {
  const poolMap: Record<string, BigNumber> = {};
  const pools = params.pools.map(pool => pool.address.toLowerCase());
  try {
    const response = (await fetch(baseApyUrl).then(res => res.json())) as JoeVaultsResponse;
    pools.forEach(pool => {
      const poolData = response.find(data => data.address == pool);
      poolMap[pool] = new BigNumber(poolData.apr1d);
    });
  } catch (err) {
    console.error('Joe Auto base apy error ', baseApyUrl, err);
  }
  return poolMap;
};

const getFarmApys = async (params): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });

  const [{ balances, rewardPerSecs, extraRewardPerSecs }] = await Promise.all([
    getPoolsData(params),
  ]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const yearlyRewards = rewardPerSecs[i].times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);
    let extraYearlyRewardsInUsd = new BigNumber(0);

    for (const extra of extraRewardPerSecs.filter(e => e.pool === pool.name)) {
      const rewardPrice = await fetchPrice({ oracle: 'tokens', id: extra.oracleId });
      const extraYearlyRewards = extra.rewardRate.times(secondsPerYear);
      extraYearlyRewardsInUsd = extraYearlyRewardsInUsd.plus(
        extraYearlyRewards.times(rewardPrice).dividedBy(extra.decimals)
      );
    }

    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraYearlyRewardsInUsd);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf()
      );
    }
  }

  return apys;
};

const getPoolsData = async params => {
  const masterchefContract = fetchContract(params.masterchef, abi, params.chainId);
  const balanceCalls = [];
  const rewardPerSecCalls = [];
  const extraData = [];
  const extraRewardPerSecCalls = [];
  params.pools.forEach(pool => {
    (pool.rewards ?? []).forEach(rewards => {
      extraData.push({ pool: pool.name, oracleId: rewards.oracleId, decimals: rewards.decimals });
      const rewarderContract = fetchContract(rewards.rewarder, ISimpleRewarder, params.chainId);
      extraRewardPerSecCalls.push(rewarderContract.read.tokenPerSec());
    });

    const tokenContract = fetchContract(pool.address, ERC20Abi, params.chainId);
    balanceCalls.push(tokenContract.read.balanceOf([params.masterchef as `0x${string}`]));
    rewardPerSecCalls.push(masterchefContract.read.farmInfo([pool.poolId]));
  });

  const [balanceResults, rewardPerSecResults, extraRewardPerSecResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardPerSecCalls),
    Promise.all(extraRewardPerSecCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map(v => new BigNumber(v.toString()));
  const rewardPerSecs: BigNumber[] = rewardPerSecResults.map(
    v => new BigNumber(v.joePerSec.toString())
  );

  const extraRewardPerSecs = extraData.map((data, index) => ({
    ...data,
    rewardRate: new BigNumber(extraRewardPerSecResults[index].toString()),
  }));
  return { balances, rewardPerSecs, extraRewardPerSecs };
};
