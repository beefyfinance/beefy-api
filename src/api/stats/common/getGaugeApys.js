const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { fetchContract } from '../../rpc/client';
import IGauge from '../../../abis/IGauge';

export const getGaugeApys = async params => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(params), getFarmApys(params)]);
  const liquidityProviderFee = params.liquidityProviderFee ?? 0.003;

  return getApyBreakdown(params.pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getTradingAprs = async params => {
  let tradingAprs = params.tradingAprs ?? {};
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = isSushiClient(client) ? getTradingFeeAprSushi : getTradingFeeApr;
    const aprs = await getAprs(client, pairAddresses, fee);
    tradingAprs = { ...tradingAprs, ...aprs };
  }
  return tradingAprs;
};

const getFarmApys = async params => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const { balances, rewardRates, stakerBalances, derivedBalances } = await getPoolsData(params);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const boost =
      stakerBalances[i] == 0 ? BigNumber(0.4) : derivedBalances[i].dividedBy(stakerBalances[i]);
    const yearlyRewards = rewardRates[i].times(secondsPerYear).times(boost);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);

    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf(),
        boost.times(2.5).valueOf()
      );
    }
  }
  return apys;
};

const getPoolsData = async params => {
  const balanceCalls = [],
    rewardRateCalls = [],
    stakerBalanceCalls = [],
    derivedBalanceCalls = [];
  params.pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, IGauge, params.chainId);
    balanceCalls.push(gauge.read.totalSupply());
    rewardRateCalls.push(gauge.read.rewardRate());
    stakerBalanceCalls.push(gauge.read.balanceOf([params.gaugeStaker]));
    derivedBalanceCalls.push(gauge.read.derivedBalance([params.gaugeStaker]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(stakerBalanceCalls),
    Promise.all(derivedBalanceCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const stakerBalances = res[2].map(v => new BigNumber(v.toString()));
  const derivedBalances = res[3].map(v => new BigNumber(v.toString()));

  return { balances, rewardRates, stakerBalances, derivedBalances };
};

module.exports = { getGaugeApys };
