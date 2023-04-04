const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');
import { getContractWithProvider } from '../../../utils/contractHelper';

const IGauge = require('../../../abis/ISolidlyGauge.json');
const ISpiritGauge = require('../../../abis/fantom/ISpiritGauge.json');
const IVe = require('../../../abis/IVe.json');
const IinSpirit = require('../../../abis/fantom/IinSpirit.json');
const fetchPrice = require('../../../utils/fetchPrice');
import { getApyBreakdown } from '../common/getApyBreakdown';
import { getContract } from '../../../utils/contractHelper';

export const getSolidlyGaugeApys = async params => {
  const apys = await getFarmApys(params);

  return getApyBreakdown(params.pools, 0, apys, 0);
};

const getFarmApys = async params => {
  const apys = [];

  const rewardTokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const { balances, rewardRates, depositBalances, derivedBalances, periodFinishes } =
    await getPoolsData(params);
  let supply = 0;
  let veBalance = 0;
  if (params.boosted && params.NFTid) {
    const ve = params.spirit
      ? getContractWithProvider(IinSpirit, params.ve, params.web3)
      : getContractWithProvider(IVe, params.ve, params.web3);
    supply = new BigNumber(await ve.methods.totalSupply().call());
    veBalance = new BigNumber(await ve.methods.balanceOfNFT(params.NFTid).call());
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
          if (gaugeDeposit.gt(derived.plus(adjusted))) {
            yearlyRewards = rewardRates[i]
              .times(secondsPerYear)
              .times(derived.plus(adjusted).dividedBy(gaugeDeposit));
          } else {
            yearlyRewards = rewardRates[i].times(secondsPerYear);
          }
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

      for (const rewards of pool.rewards ?? []) {
        const gauge = getContractWithProvider(
          params.abi ? params.abi : IGauge,
          pool.gauge,
          params.web3
        );
        const rate = new BigNumber(await gauge.methods.rewardRate(rewards.address).call());
        const data = new BigNumber(await gauge.methods.rewardData(rewards.address).call());

        //console.log(rate.toString());
        if (data.periodFinish > Date.now() / 1000) {
          const additionalRewards = params.boosted
            ? rate
                .times(secondsPerYear)
                .times(await fetchPrice({ oracle: 'tokens', id: rewards.oracleId }))
                .dividedBy(rewards.decimals)
                .times(0.4)
            : rate
                .times(secondsPerYear)
                .times(await fetchPrice({ oracle: 'tokens', id: rewards.oracleId }))
                .dividedBy(rewards.decimals);

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
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  const balanceCalls = [];
  const rewardRateCalls = [];
  const depositBalanceCalls = [];
  const derivedBalanceCalls = [];
  const periodFinishCalls = [];
  params.pools.forEach(pool => {
    const rewardPool = params.spirit
      ? getContract(ISpiritGauge, pool.gauge)
      : getContract(IGauge, pool.gauge);
    balanceCalls.push({
      balance:
        params.boosted && params.NFTid
          ? rewardPool.methods.derivedSupply()
          : rewardPool.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: params.spirit
        ? rewardPool.methods.rewardRate()
        : rewardPool.methods.rewardRate(params.reward),
    });
    periodFinishCalls.push({
      periodFinish: params.spirit
        ? rewardPool.methods.periodFinish()
        : rewardPool.methods.periodFinish(params.reward),
    });
    if (params.boosted && params.NFTid) {
      depositBalanceCalls.push({
        depositBalance: rewardPool.methods.balanceOf(params.gaugeStaker),
      });
    }
    if (params.spirit) {
      depositBalanceCalls.push({
        depositBalance: rewardPool.methods.balanceOf(params.gaugeStaker),
      });
      derivedBalanceCalls.push({
        derivedBalance: rewardPool.methods.derivedBalance(params.gaugeStaker),
      });
    }
  });

  const res = await multicall.all([
    balanceCalls,
    rewardRateCalls,
    depositBalanceCalls,
    derivedBalanceCalls,
    periodFinishCalls,
  ]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const depositBalances = res[2].map(v => new BigNumber(v.depositBalance));
  const derivedBalances = res[3].map(v => new BigNumber(v.derivedBalance));
  const periodFinishes = res[4].map(v => v.periodFinish);
  return { balances, rewardRates, depositBalances, derivedBalances, periodFinishes };
};

module.exports = { getSolidlyGaugeApys };
