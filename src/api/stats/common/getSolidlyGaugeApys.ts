import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Abi, Address } from 'viem';
import ISpiritGauge from '../../../abis/fantom/ISpiritGauge.ts';
import InfraredGauge from '../../../abis/InfraredGauge.ts';
import ISolidlyGauge from '../../../abis/ISolidlyGauge.ts';
import IVe from '../../../abis/IVe.ts';
import RamsesGauge from '../../../abis/RamsesGauge.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdown.ts';

const logger = getLoggerFor({ module: 'apy', component: 'solidlyGauge' });

const KittenswapGauge = [
  {
    inputs: [],
    name: 'finishAt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

type SolidlyGaugeStructRewardData = {
  rewardRate: bigint;
  periodFinish: bigint;
  lastUpdateTime: bigint;
  rewardPerTokenStored: bigint;
};

type SolidlyGaugeTupleRewardData = readonly [Address, bigint, bigint, bigint, bigint, bigint, bigint];

type SolidlyGaugeRewardRate = bigint | SolidlyGaugeStructRewardData | SolidlyGaugeTupleRewardData;

type SolidlyGaugeRewardDataEntry = BigNumber & Partial<Pick<SolidlyGaugeStructRewardData, 'periodFinish'>>;

export type SolidlyGaugeReward = {
  address: string;
  oracleId: string;
  decimals: string;
};

export type SolidlyGaugePool = {
  name: string;
  address: string;
  gauge: string;
  oracle?: string;
  oracleId?: string;
  decimals?: string;
  bribe?: number;
  beefyFee?: number;
  rewards?: SolidlyGaugeReward[];
};

type SolidlyGaugeApyParamsFields = {
  chainId: ChainId;
  pools: SolidlyGaugePool[];
  oracle: string;
  oracleId: string;
  decimals: string;
  reward?: string;
  singleReward?: boolean;
  ramses?: boolean;
  infrared?: boolean;
  kitten?: boolean;
  abi?: Abi;
  rewardScale?: number;
  log?: boolean;
};

type SolidlyGaugeVeless = {
  boosted?: false | undefined;
  NFTid?: undefined;
  ve?: undefined;
  spirit?: false | undefined;
  gaugeStaker?: undefined;
};

type SolidlyGaugeVeBoosted = {
  boosted: boolean;
  NFTid: bigint;
  ve: Address;
  spirit?: false | undefined;
  gaugeStaker: Address;
};

type SolidlyGaugeSpiritBoosted = {
  boosted?: false | undefined;
  NFTid?: undefined;
  ve?: undefined;
  spirit: boolean;
  gaugeStaker: Address;
};

export type SolidlyGaugeApyParams = SolidlyGaugeApyParamsFields &
  (SolidlyGaugeVeless | SolidlyGaugeVeBoosted | SolidlyGaugeSpiritBoosted);

export const getSolidlyGaugeApys = async (params: SolidlyGaugeApyParams) => {
  const apys = await getFarmApys(params);
  return getApyBreakdown(params.pools, undefined, apys, 0);
};

export const getFarmApys = async (params: SolidlyGaugeApyParams) => {
  const apys: BigNumber[] = [];

  let supply = new BigNumber(0);
  let veBalance = new BigNumber(0);

  const poolDataCalls = getPoolsData(params);

  const nftCalls: Promise<bigint>[] = [];
  if (params.boosted && params.NFTid) {
    const veContract = fetchContract(params.ve, IVe, params.chainId);

    nftCalls.push(veContract.read.totalSupply());
    nftCalls.push(veContract.read.balanceOfNFT([params.NFTid]));
  }

  const [nftResults, poolDataResults] = await Promise.all([Promise.all(nftCalls), poolDataCalls]);
  const { balances, rewardRates, depositBalances, derivedBalances, periodFinishes, rewardsRates, rewardData } =
    poolDataResults;
  if (params.boosted && params.NFTid) {
    supply = new BigNumber(nftResults[0]);
    veBalance = new BigNumber(nftResults[1]);
  }

  const rewardTokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });

  for (let i = 0; i < params.pools.length; i++) {
    let yearlyRewardsInUsd = new BigNumber(0);
    let totalStakedInUsd = new BigNumber(0);
    const pool = params.pools[i];
    if (Number(periodFinishes[i]) > Date.now() / 1000) {
      const oracle = pool.oracle ?? 'lps';
      const id = pool.oracleId ?? pool.name;
      const stakedPrice = await fetchPrice({ oracle, id });

      let boost: { deposit: BigNumber; derived: BigNumber; adjusted: BigNumber } | undefined;
      if (params.boosted && params.NFTid) {
        const deposit = depositBalances[i].dividedBy('1e18');
        boost = {
          deposit,
          derived: deposit.times(40).dividedBy(100),
          adjusted: balances[i].times(veBalance).dividedBy(supply).dividedBy('1e18').times(60).dividedBy(100),
        };
      }

      totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

      const secondsPerYear = 31536000;
      let yearlyRewards: number | BigNumber = 0;
      if (params.boosted) {
        if (boost) {
          const boostedBalance = boost.derived.plus(boost.adjusted);
          yearlyRewards = boost.deposit.gt(boostedBalance)
            ? rewardRates[i].times(secondsPerYear).times(boostedBalance.dividedBy(boost.deposit))
            : rewardRates[i].times(secondsPerYear);
        } else if (params.spirit) {
          yearlyRewards = rewardRates[i].times(secondsPerYear).times(derivedBalances[i]).dividedBy(depositBalances[i]);
        } else {
          yearlyRewards = rewardRates[i].times(secondsPerYear).times(0.4);
        }
      } else {
        yearlyRewards = rewardRates[i].times(secondsPerYear);
      }

      yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);
      if (pool.bribe) yearlyRewardsInUsd = yearlyRewardsInUsd.times(1 - pool.bribe);
      if (params.rewardScale) yearlyRewardsInUsd = yearlyRewardsInUsd.dividedBy(params.rewardScale);

      for (const [index, reward] of Object.entries(pool.rewards ?? [])) {
        const rate = rewardsRates[i][Number(index)];
        const periodFinish = rewardData[i][Number(index)].periodFinish ?? rewardData[i][Number(index)];

        if (Number(periodFinish) > Date.now() / 1000) {
          const additionalRewards = rate
            .times(secondsPerYear)
            .times(await fetchPrice({ oracle: 'tokens', id: reward.oracleId }))
            .dividedBy(reward.decimals)
            .times(params.boosted ? 0.4 : 1);

          yearlyRewardsInUsd = yearlyRewardsInUsd.plus(additionalRewards);
        }
      }
    }

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);

    if (params.log) {
      logger.debug(
        {
          pool: pool.name,
          apy: apy.toNumber(),
          tvl: totalStakedInUsd.valueOf(),
          yearlyUsd: yearlyRewardsInUsd.valueOf(),
        },
        'pool apy'
      );
    }
  }
  return apys;
};

const getPoolsData = async (params: SolidlyGaugeApyParams) => {
  const balanceCalls: Promise<bigint>[] = [];
  const rateCalls: Promise<SolidlyGaugeRewardRate>[] = [];
  const depositBalanceCalls: Promise<bigint>[] = [];
  const derivedBalanceCalls: Promise<bigint>[] = [];
  const periodFinishCalls: Promise<SolidlyGaugeRewardRate>[] = [];
  const rewardRateCalls: Promise<unknown>[] = [];
  const rewardDataCalls: Promise<unknown>[] = [];

  params.pools.forEach(pool => {
    const poolContract = fetchContract(
      pool.gauge,
      params.spirit || params.singleReward
        ? ISpiritGauge
        : params.ramses
          ? RamsesGauge
          : params.infrared
            ? InfraredGauge
            : params.kitten
              ? KittenswapGauge
              : ISolidlyGauge,
      params.chainId
    );

    balanceCalls.push(
      params.boosted && params.NFTid ? poolContract.read.derivedSupply() : poolContract.read.totalSupply()
    );

    // FIXME(unsafe-cast): may be undefined
    const reward = params.reward as Address;
    rateCalls.push(
      params.spirit || params.singleReward || params.kitten
        ? poolContract.read.rewardRate()
        : params.ramses || params.infrared
          ? poolContract.read.rewardData([reward])
          : poolContract.read.rewardRate([reward])
    );
    periodFinishCalls.push(
      params.spirit || params.singleReward
        ? poolContract.read.periodFinish()
        : params.ramses || params.infrared
          ? poolContract.read.rewardData([reward])
          : params.kitten
            ? poolContract.read.finishAt()
            : poolContract.read.periodFinish([reward])
    );

    if (params.boosted && params.NFTid) {
      depositBalanceCalls.push(poolContract.read.balanceOf([params.gaugeStaker]));
    }
    if (params.spirit) {
      depositBalanceCalls.push(poolContract.read.balanceOf([params.gaugeStaker]));
      derivedBalanceCalls.push(poolContract.read.derivedBalance([params.gaugeStaker]));
    }

    for (const rewards of pool.rewards ?? []) {
      const gaugeContract = fetchContract(pool.gauge, params.abi ? params.abi : ISolidlyGauge, params.chainId);
      rewardRateCalls.push(gaugeContract.read.rewardRate([rewards.address]));
      rewardDataCalls.push(
        params.abi
          ? gaugeContract.read.rewardData([rewards.address])
          : gaugeContract.read.periodFinish([rewards.address])
      );
    }
  });

  const [
    balanceResults,
    rateResults,
    depositBalanceResults,
    derivedBalanceResults,
    periodFinishResults,
    rewardRateResults,
    rewardDataResults,
  ] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rateCalls),
    Promise.all(depositBalanceCalls),
    Promise.all(derivedBalanceCalls),
    Promise.all(periodFinishCalls),
    Promise.all(rewardRateCalls),
    Promise.all(rewardDataCalls),
  ]);

  const balances = balanceResults.map(v => new BigNumber(v));
  // FIXME(unsafe-cast): unsafe narrow
  const rates = params.ramses
    ? rateResults.map(v => new BigNumber((v as SolidlyGaugeStructRewardData)['rewardRate']))
    : params.infrared
      ? rateResults.map(v => new BigNumber((v as SolidlyGaugeTupleRewardData)[3]))
      : rateResults.map(v => new BigNumber(v.toString()));
  const depositBalances = depositBalanceResults.map(v => new BigNumber(v));
  const derivedBalances = derivedBalanceResults.map(v => new BigNumber(v));
  // FIXME(unsafe-cast): unsafe narrow
  const periodFinishes = params.ramses
    ? periodFinishResults.map(v => (v as SolidlyGaugeStructRewardData)['periodFinish'].toString())
    : params.infrared
      ? periodFinishResults.map(v => (v as SolidlyGaugeTupleRewardData)[2].toString())
      : periodFinishResults.map(v => new BigNumber(v.toString()));
  // FIXME(unsafe-cast): unchecked response shape
  const rewardRateFlat = rewardRateResults.map(v => new BigNumber(v as bigint));
  // FIXME(unsafe-cast): unchecked response shape
  const rewardDataFlat = rewardDataResults.map(v => new BigNumber(v as bigint));

  const rewardsRates: BigNumber[][] = [];
  const rewardData: SolidlyGaugeRewardDataEntry[][] = [];
  let globalIndex = 0;
  params.pools.forEach(pool => {
    const rates: BigNumber[] = [];
    const data: SolidlyGaugeRewardDataEntry[] = [];

    for (const _ of pool.rewards ?? []) {
      rates.push(rewardRateFlat[globalIndex]);
      data.push(rewardDataFlat[globalIndex]);
      globalIndex++;
    }

    rewardsRates.push(rates);
    rewardData.push(data);
  });

  return {
    balances,
    rewardRates: rates,
    depositBalances,
    derivedBalances,
    periodFinishes,
    rewardsRates,
    rewardData,
  };
};
