const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import IRewardPool from '../../../abis/IRewardPool';
import InfraredGauge from '../../../abis/InfraredGauge';
import IWrapper from '../../../abis/IWrapper';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import getBlockNumber from '../../../utils/getBlockNumber';
import getBlockTime from '../../../utils/getBlockTime';

export const getRewardPoolApys = async params => {
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

  if (params.gammaClient) {
    const response = await fetch(params.gammaClient).then(res => res.json());
    params.pools.forEach(p => {
      tradingAprs[p.address.toLowerCase()] = new BigNumber(
        response[p.address.toLowerCase()].returns.daily.feeApr
      );
    });
  }
  return tradingAprs;
};

export const getFarmApys = async params => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const rewardTokenPriceCall = params.isRewardInXToken
    ? getXPrice(tokenPrice, params)
    : new Promise(resolve => resolve(tokenPrice));

  const [rewardTokenPrice, { balances, rewardRates, periodFinishes, extras }] = await Promise.all([
    rewardTokenPriceCall,
    getPoolsData(params),
  ]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const blockTime = params.periodFinish === 'periodInBlockFinish' ? await getBlockTime(params.chainId) : 0;
    const secondsPerYear = params.periodFinish === 'periodInBlockFinish' ? 31536000 / blockTime : 31536000;
    const yearlyRewards = rewardRates[i].times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);
    const block = params.periodFinish === 'periodInBlockFinish' ? await getBlockNumber(params.chainId) : 0;

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      const price = await fetchPrice({ oracle: 'tokens', id: extra.token });
      const extraRewardsInUsd = extra.rewardRate
        .times(secondsPerYear)
        .times(price)
        .div(extra.decimals || '1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
    }

    const isActive =
      params.periodFinish === 'periodInBlockFinish'
        ? periodFinishes[i].isGreaterThanOrEqualTo(block)
        : periodFinishes[i].isGreaterThanOrEqualTo(Math.floor(Date.now() / 1000));

    const apy = isActive ? yearlyRewardsInUsd.dividedBy(totalStakedInUsd) : new BigNumber(0);
    apys.push(apy);

    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewardsInUsd.valueOf(),
        rewardTokenPrice.valueOf(),
        rewardRates[i].valueOf(),
        periodFinishes[i].valueOf()
      );
    }
  }
  return apys;
};

export const getPoolsData = async params => {
  const balanceCalls = [];
  const rewardRateCalls = [];
  const periodFinishCalls = [];
  const extraCalls = [];
  const extraData = [];
  const periodFinish = params.periodFinish ?? 'periodFinish';
  const abi = params.periodFinish
    ? getAbi(periodFinish)
    : params.cake
    ? IWrapper
    : params.infrared
    ? InfraredGauge
    : IRewardPool;

  params.pools.forEach(pool => {
    const rewardPool = fetchContract(pool.rewardPool ? pool.rewardPool : pool.gauge, abi, params.chainId);

    const stakedTokenContract = fetchContract(pool.address, ERC20Abi, params.chainId);
    balanceCalls.push(
      params.cake ? stakedTokenContract.read.balanceOf([pool.gauge]) : rewardPool.read.totalSupply()
    );
    rewardRateCalls.push(
      params.cake
        ? rewardPool.read.rewardPerSecond()
        : params.infrared
        ? rewardPool.read.rewardData([params.reward])
        : rewardPool.read.rewardRate()
    );
    periodFinishCalls.push(
      params.cake
        ? rewardPool.read.endTimestamp()
        : params.infrared
        ? rewardPool.read.rewardData([params.reward])
        : rewardPool.read[periodFinish]()
    );

    pool.extras?.forEach(extra => {
      const extraPool = fetchContract(
        extra.rewardPool,
        extra.infrared ? InfraredGauge : IWrapper,
        params.chainId
      );
      extraCalls.push(
        extra.infrared ? extraPool.read.rewardData([extra.rewardToken]) : extraPool.read.rewardPerSecond()
      );
      extraData.push({ pool: pool.name, token: extra.oracleId });
    });
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(periodFinishCalls),
    Promise.all(extraCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(params.infrared ? v[3].toString() : v.toString()));
  const periodFinishes = res[2].map(v => new BigNumber(params.infrared ? v[2].toString() : v.toString()));
  const extraRates = res[3].map(v => new BigNumber(params.infrared ? v[3].toString() : v.toString()));
  const extras = extraData.map((v, i) => ({ ...v, rewardRate: extraRates[i] }));

  return { balances, rewardRates, periodFinishes, extras };
};

const getXPrice = async (tokenPrice, params) => {
  const tokenContract = fetchContract(params.tokenAddress, ERC20Abi, params.chainId);
  const xTokenContract = fetchContract(params.xTokenAddress, ERC20Abi, params.chainId);
  const [stakedInXPool, totalXSupply] = await Promise.all([
    tokenContract.read.balanceOf([params.xTokenAddress]),
    xTokenContract.read.totalSupply(),
  ]);

  return new BigNumber(stakedInXPool.toString())
    .times(tokenPrice)
    .dividedBy(new BigNumber(totalXSupply.toString));
};

const getAbi = periodFinish => {
  return [
    ...IRewardPool,
    {
      inputs: [],
      name: periodFinish,
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];
};

module.exports = { getRewardPoolApys, getFarmApys, getPoolsData };
