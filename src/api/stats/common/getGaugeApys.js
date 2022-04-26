const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');

const IGauge = require('../../../abis/IGauge.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { getContract } from '../../../utils/contractHelper';

export const getGaugeApys = async params => {
  const tradingAprs = await getTradingAprs(params);
  const farmApys = await getFarmApys(params);

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
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  const calls = [];
  params.pools.forEach(pool => {
    const gauge = getContract(IGauge, pool.gauge);
    calls.push({
      balance: gauge.methods.totalSupply(),
      rewardRate: gauge.methods.rewardRate(),
      stakerBalance: gauge.methods.balanceOf(params.gaugeStaker),
      derivedBalance: gauge.methods.derivedBalance(params.gaugeStaker),
    });
  });

  const res = await multicall.all([calls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[0].map(v => new BigNumber(v.rewardRate));
  const stakerBalances = res[0].map(v => new BigNumber(v.stakerBalance));
  const derivedBalances = res[0].map(v => new BigNumber(v.derivedBalance));

  return { balances, rewardRates, stakerBalances, derivedBalances };
};

module.exports = { getGaugeApys };
