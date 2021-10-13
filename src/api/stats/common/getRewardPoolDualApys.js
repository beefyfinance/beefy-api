const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');

const IStakingDualRewards = require('../../../abis/StakingDualRewards.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { isSushiClient } from '../../../apollo/client';
import { getTradingFeeApr, getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';

export const getRewardPoolDualApys = async params => {
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
  const tokenPrice = await fetchPrice({ oracle: params.oracleA, id: params.oracleIdA });
  const rewardATokenPrice = params.isRewardInXToken
                             ? await getXPrice(tokenPrice, params)
                             : tokenPrice;
  const rewardBTokenPrice = await fetchPrice({ oracle: params.oracleB, id: params.oracleIdB });
  const { balances, rewardRatesA, rewardRatesB } = await getPoolsData(params);
  console.log(balances, rewardRatesA, rewardRatesB);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const yearlyRewardsA = rewardRatesA[i].times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewardsA.times(rewardATokenPrice).dividedBy(params.decimalsA);

    const yearlyRewardsB = rewardRatesB[i].times(secondsPerYear);
    const yearlyRewardsBInUsd = yearlyRewardsB.times(rewardBTokenPrice).dividedBy(params.decimalsB);
    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

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
  const rewardRateACalls = [];
  const rewardRateBCalls = [];
  params.pools.forEach(pool => {
    const rewardPool = new web3.eth.Contract(IStakingDualRewards, pool.rewardPool);
    balanceCalls.push({
      balance: rewardPool.methods.totalSupply(),
    });
    rewardRateACalls.push({
      rewardRateA: rewardPool.methods.rewardRateA(),
    });
    rewardRateBCalls.push({
      rewardRateB: rewardPool.methods.rewardRateB(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateACalls, rewardRateBCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRatesA = res[1].map(v => new BigNumber(v.rewardRateA));
  const rewardRatesB = res[2].map(v => new BigNumber(v.rewardRateB));
  return { balances, rewardRatesA, rewardRatesB };
};

const getXPrice = async (tokenPrice, params) => {
  const tokenContract = new params.web3.eth.Contract(ERC20, params.tokenAddress);
  const xTokenContract = new params.web3.eth.Contract(ERC20, params.xTokenAddress);
  const stakedInXPool = new BigNumber(await tokenContract.methods.balanceOf(params.xTokenAddress).call());
  const totalXSupply = new BigNumber(await xTokenContract.methods.totalSupply().call());

  return stakedInXPool.times(tokenPrice).dividedBy(totalXSupply);
}

module.exports = { getRewardPoolDualApys };
