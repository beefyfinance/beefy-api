const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');
import { getContractWithProvider } from '../../../utils/contractHelper';

const IGauge = require('../../../abis/ISolidlyGauge.json');
const fetch = require('node-fetch');
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
  const { balances, rewardRates, depositBalances, derivedBalances } = await getPoolsData(params);
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
    const pool = params.pools[i];

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

    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

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

    const yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);

    let apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    if (pool.lidoUrl) {
      const response = await fetch(pool.lidoUrl).then(res => res.json());
      let apr = 0;
      pool.polygon ? (apr = response.apr) : (apr = response.data.steth);
      let aprFixed = apr / 100 / 2;
      apy = apy.plus(aprFixed);
    }
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
  params.pools.forEach(pool => {
    const rewardPool = params.spirit
      ? getContract(ISpiritGauge, pool.gauge)
      : getContract(IGauge, pool.gauge);
    balanceCalls.push({
      balance: params.boosted
        ? rewardPool.methods.derivedSupply()
        : rewardPool.methods.totalSupply(),
    });
    rewardRateCalls.push({
      rewardRate: params.spirit
        ? rewardPool.methods.rewardRate()
        : rewardPool.methods.rewardRate(params.reward),
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
  ]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const depositBalances = res[2].map(v => new BigNumber(v.depositBalance));
  const derivedBalances = res[3].map(v => new BigNumber(v.derivedBalance));
  return { balances, rewardRates, depositBalances, derivedBalances };
};

module.exports = { getSolidlyGaugeApys };
