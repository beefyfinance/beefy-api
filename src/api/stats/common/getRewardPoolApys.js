const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import IRewardPool from '../../../abis/IRewardPool';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

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
  return tradingAprs;
};

const getFarmApys = async params => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const rewardTokenPriceCall = params.isRewardInXToken
    ? getXPrice(tokenPrice, params)
    : new Promise(resolve => resolve(tokenPrice));

  const [rewardTokenPrice, { balances, rewardRates, periodFinishes }] = await Promise.all([
    rewardTokenPriceCall,
    getPoolsData(params),
  ]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const yearlyRewards = rewardRates[i].times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(params.decimals);

    const apy = periodFinishes[i].isGreaterThanOrEqualTo(Math.floor(Date.now() / 1000))
      ? yearlyRewardsInUsd.dividedBy(totalStakedInUsd)
      : new BigNumber(0);
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
  const rewardRateCalls = [];
  const periodFinishCalls = [];
  const periodFinish = params.periodFinish ?? 'periodFinish';
  const abi = params.periodFinish ? getAbi(periodFinish) : IRewardPool;

  params.pools.forEach(pool => {
    const rewardPool = fetchContract(
      pool.rewardPool ? pool.rewardPool : pool.gauge,
      abi,
      params.chainId
    );
    balanceCalls.push(rewardPool.read.totalSupply());
    rewardRateCalls.push(rewardPool.read.rewardRate());
    periodFinishCalls.push(rewardPool.read[periodFinish]());
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(periodFinishCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const periodFinishes = res[2].map(v => new BigNumber(v.toString()));
  return { balances, rewardRates, periodFinishes };
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

module.exports = { getRewardPoolApys };
