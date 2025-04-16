import { getApyBreakdown, ApyBreakdownResult } from '../getApyBreakdown';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../../utils/fetchPrice';
import IAuraMinter from '../../../../abis/IAuraMinter';
import { default as IAuraGauge } from '../../../../abis/ethereum/AuraGauge';
import { fetchContract } from '../../../rpc/client';
import { getBalTradingAndLstApr } from '../../../../utils/getBalancerTradingFeeAndLstApr';

interface Token {
  newGauge?: boolean;
  oracle: string;
  oracleId?: string;
  decimals?: string;
}

interface Underlying {
  address: string;
  index: number;
  poolId?: string;
  bbIndex?: number;
}

interface Pool {
  name: string;
  address: string;
  gauge: string;
  tokens: Token[];
  beefyFee?: number;
  status?: string;
  lsIndex?: number | number[];
  cmpIndex?: number;
  composable?: boolean;
  bptIndex?: number;
  vaultPoolId?: number;
  lsUrl?: string | string[];
  dataPath?: string | string[];
  lsAprFactor?: number | number[];
  balancerChargesFee?: boolean;
  includesComposableAaveTokens?: boolean;
  aaveUnderlying?: Underlying[];
  bbPoolId?: string;
  bbIndex?: number;
  composableSplit?: boolean;
  divisor?: number[];
  balancerApi?: boolean;
}

interface BalancerParams {
  chainId: number;
  pools: Pool[];
  balancerVault: string;
  aaveDataProvider: string;
  auraMinter: string;
  log?: boolean;
}

const liquidityProviderFee = 0.0025;
const secondsInAYear = 31536000;

export const getAuraApys = async (params: BalancerParams): Promise<ApyBreakdownResult> => {
  const pairAddresses = params.pools.map(pool => pool.address);

  const [tradingAprAndLstData, farmApys] = await Promise.all([
    getTradingFeeAprBalancer(params.chainId, pairAddresses),
    getPoolApys(params),
  ]);

  return getApyBreakdown(
    params.pools,
    tradingAprAndLstData.tradingAprMap as Record<string, BigNumber>,
    farmApys,
    liquidityProviderFee,
    tradingAprAndLstData.lstAprs
  );
};

const getTradingFeeAprBalancer = async (chainId, pairAddresses) => {
  const data = await getBalTradingAndLstApr(chainId, pairAddresses);
  return data;
};

const getPoolApys = async (params: BalancerParams) => {
  const apys = [];

  const { balances, rewardRates, periodFinishes, extras, auraRate } = await getPoolsData(params);

  for (let i = 0; i < params.pools.length; i++) {
    const rewardsApy = await getPoolApy(
      params.pools[i],
      params,
      balances[i],
      rewardRates[i],
      periodFinishes[i],
      extras,
      auraRate
    );

    apys.push(rewardsApy);
  }

  return apys;
};

const getPoolApy = async (
  pool: Pool,
  params: BalancerParams,
  balance: BigNumber,
  rewardRate: BigNumber,
  finish: number,
  extras,
  auraRate
) => {
  if (pool.status === 'eol') return new BigNumber(0);

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool, rewardRate, finish, extras, auraRate),
    getTotalStakedInUsd(pool, balance),
  ]);

  let rewardsApy: BigNumber = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  if (params.log) {
    console.log(pool.name, rewardsApy.toNumber(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  }

  return rewardsApy;
};

const getTotalStakedInUsd = async (pool, balance) => {
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return balance.multipliedBy(lpPrice).dividedBy('1e18');
};

const getYearlyRewardsInUsd = async (pool, rewardRate, finish, extras, auraRate) => {
  let yearlyRewardsInUsd = new BigNumber(0);
  let auraYearlyRewardsInUsd = new BigNumber(0);
  if (finish > Date.now() / 1000) {
    const balPrice = await fetchPrice({ oracle: 'tokens', id: 'BAL' });
    const auraPrice = await fetchPrice({ oracle: 'tokens', id: 'AURA' });
    const yearlyRewards = rewardRate.times(secondsInAYear);
    const auraYearlyRewards = yearlyRewards.times(auraRate).dividedBy('1e18');
    auraYearlyRewardsInUsd = auraYearlyRewards.times(auraPrice).dividedBy('1e18');
    yearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy('1e18');
  }

  let extraRewardsInUsd = new BigNumber(0);
  for (const extra of extras.filter(e => e.pool === pool.name)) {
    if (extra.periodFinish < Date.now() / 1000) continue;
    const price = await fetchPrice({
      oracle: 'tokens',
      id: extra.oracleId,
    });
    extraRewardsInUsd = extraRewardsInUsd.plus(
      extra.rewardRate.times(secondsInAYear).times(price).div(extra.decimals)
    );
    // console.log(pool.name, extra.oracleId, extraRewardsInUsd.valueOf());
  }

  yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd).plus(auraYearlyRewardsInUsd);

  return yearlyRewardsInUsd;
};

const getPoolsData = async params => {
  const gaugeSupplyCalls = [];
  const gaugeRateCalls = [];
  const gaugePeriodFinishCalls = [];
  const extraData = [];
  const extraRewardRateCalls = [];
  const extraRewardPeriodFinishCalls = [];
  const auraMinter = fetchContract(params.auraMinter, IAuraMinter, params.chainId);

  params.pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, IAuraGauge, params.chainId);

    gaugeSupplyCalls.push(gauge.read.totalSupply());
    gaugeRateCalls.push(gauge.read.rewardRate());
    gaugePeriodFinishCalls.push(gauge.read.periodFinish());

    pool.rewards?.forEach(reward => {
      const virtualGauge = fetchContract(reward.rewardGauge, IAuraGauge, params.chainId);
      extraData.push({ pool: pool.name, oracleId: reward.oracleId, decimals: reward.decimals });
      extraRewardRateCalls.push(virtualGauge.read.rewardRate());
      extraRewardPeriodFinishCalls.push(virtualGauge.read.periodFinish());
    });
  });

  const mintRateCall = auraMinter.read.mintRate();

  const res = await Promise.all([
    Promise.all(gaugeSupplyCalls),
    Promise.all(gaugeRateCalls),
    Promise.all(gaugePeriodFinishCalls),
    Promise.all(extraRewardRateCalls),
    Promise.all(extraRewardPeriodFinishCalls),
    mintRateCall,
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const periodFinishes = res[2].map(v => Number(v));
  const extras = extraData.map((data, index) => ({
    ...data,
    rewardRate: new BigNumber(res[3][index].toString()),
    periodFinish: new BigNumber(res[4][index].toString()),
  }));

  const auraRate = new BigNumber(res[5].toString());

  return { balances, rewardRates, periodFinishes, extras, auraRate };
};
