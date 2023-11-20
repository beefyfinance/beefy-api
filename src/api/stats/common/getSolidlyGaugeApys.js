const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
import { getApyBreakdown } from '../common/getApyBreakdown';
import ISpiritGauge from '../../../abis/fantom/ISpiritGauge';
import ISolidlyGauge from '../../../abis/ISolidlyGauge';
import IinSpirit from '../../../abis/fantom/IinSpirit';
import IVe from '../../../abis/IVe';
import { fetchContract } from '../../rpc/client';

export const getSolidlyGaugeApys = async params => {
  const apys = await getFarmApys(params);
  return getApyBreakdown(params.pools, 0, apys, 0);
};

const getFarmApys = async params => {
  const apys = [];

  let supply = new BigNumber(0);
  let veBalance = new BigNumber(0);

  const poolDataCalls = getPoolsData(params);
  const nftCalls = [];
  const rewardTokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });

  if (params.boosted && params.NFTid) {
    const veContract = params.spirit
      ? fetchContract(params.ve, IinSpirit, params.chainId)
      : fetchContract(params.ve, IVe, params.chainId);

    nftCalls.push(veContract.read.totalSupply());
    nftCalls.push(veContract.read.balanceOfNFT([params.NFTid]));
  }

  const [nftResults, poolDataResults] = await Promise.all([Promise.all(nftCalls), poolDataCalls]);
  const {
    balances,
    rewardRates,
    depositBalances,
    derivedBalances,
    periodFinishes,
    rewardsRates,
    rewardData,
  } = poolDataResults;
  if (params.boosted && params.NFTid) {
    supply = new BigNumber(nftResults[0].toString());
    veBalance = new BigNumber(nftResults[1].toString());
  }

  for (let i = 0; i < params.pools.length; i++) {
    let yearlyRewardsInUsd = new BigNumber(0);
    let totalStakedInUsd = new BigNumber(0);
    const pool = params.pools[i];
    if (periodFinishes[i] > Date.now() / 1000) {
      const oracle = pool.oracle ?? 'lps';
      const id = pool.oracleId ?? pool.name;
      const stakedPrice = await fetchPrice({ oracle, id });

      let boost = false;
      let derived;
      let adjusted;
      let gaugeDeposit;
      if (params.boosted && params.NFTid) {
        boost = true;
        gaugeDeposit = depositBalances[i].dividedBy('1e18');
        derived = gaugeDeposit.times(40).dividedBy(100);
        adjusted = balances[i]
          .times(veBalance)
          .dividedBy(supply)
          .dividedBy('1e18')
          .times(60)
          .dividedBy(100);
      }

      totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

      const secondsPerYear = 31536000;
      let yearlyRewards = 0;
      if (params.boosted) {
        if (boost) {
          yearlyRewards = gaugeDeposit.gt(derived.plus(adjusted))
            ? rewardRates[i]
                .times(secondsPerYear)
                .times(derived.plus(adjusted).dividedBy(gaugeDeposit))
            : rewardRates[i].times(secondsPerYear);
        } else if (params.spirit) {
          yearlyRewards = rewardRates[i]
            .times(secondsPerYear)
            .times(derivedBalances[i])
            .dividedBy(depositBalances[i]);
        } else {
          yearlyRewards = rewardRates[i].times(secondsPerYear).times(0.4);
        }
      } else {
        yearlyRewards = rewardRates[i].times(secondsPerYear);
      }

      yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);

      for (const [index, reward] of Object.entries(pool.rewards ?? [])) {
        const rate = rewardsRates[i][index];
        const periodFinish = rewardData[i][index].periodFinish ?? rewardData[i][index];

        if (periodFinish > Date.now() / 1000) {
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
  const balanceCalls = [];
  const rateCalls = [];
  const depositBalanceCalls = [];
  const derivedBalanceCalls = [];
  const periodFinishCalls = [];
  const rewardRateCalls = [];
  const rewardDataCalls = [];

  params.pools.forEach(pool => {
    const poolContract = fetchContract(
      pool.gauge,
      params.spirit || params.singleReward ? ISpiritGauge : ISolidlyGauge,
      params.chainId
    );

    balanceCalls.push(
      params.boosted && params.NFTid
        ? poolContract.read.derivedSupply()
        : poolContract.read.totalSupply()
    );
    rateCalls.push(
      params.spirit || params.singleReward
        ? poolContract.read.rewardRate()
        : poolContract.read.rewardRate([params.reward])
    );
    periodFinishCalls.push(
      params.spirit || params.singleReward
        ? poolContract.read.periodFinish()
        : poolContract.read.periodFinish([params.reward])
    );

    if (params.boosted && params.NFTid) {
      depositBalanceCalls.push(poolContract.read.balanceOf([params.gaugeStaker]));
    }
    if (params.spirit) {
      depositBalanceCalls.push(poolContract.read.balanceOf([params.gaugeStaker]));
      derivedBalanceCalls.push(poolContract.read.derivedBalance([params.gaugeStaker]));
    }

    for (const rewards of pool.rewards ?? []) {
      const gaugeContract = fetchContract(
        pool.gauge,
        params.abi ? params.abi : ISolidlyGauge,
        params.chainId
      );
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

  const balances = balanceResults.map(v => new BigNumber(v.toString()));
  const rates = rateResults.map(v => new BigNumber(v.toString()));
  const depositBalances = depositBalanceResults.map(v => new BigNumber(v.toString()));
  const derivedBalances = derivedBalanceResults.map(v => new BigNumber(v.toString()));
  const periodFinishes = periodFinishResults.map(v => v.toString());
  const rewardRateFlat = rewardRateResults.map(v => new BigNumber(v.toString()));
  const rewardDataFlat = rewardDataResults.map(v => new BigNumber(v.toString()));

  const rewardsRates = [];
  const rewardData = [];
  let globalIndex = 0;
  params.pools.forEach(pool => {
    const rates = [];
    const data = [];

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

module.exports = { getSolidlyGaugeApys };
