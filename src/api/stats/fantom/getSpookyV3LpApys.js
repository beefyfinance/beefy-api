const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/fantom/spookyV3LpPools.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { SPOOKY_LPF } from '../../../constants';
import SpookyChefV2 from '../../../abis/fantom/SpookyChefV2';
import SpookyComplexRewarder from '../../../abis/fantom/SpookyComplexRewarder';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const { spookyClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0x9C9C920E51778c4ABF727b8Bb223e78132F00aA4';
const oracleIdA = 'BOO';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = SPOOKY_LPF;

const getSpookyV3LpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const pairAddresses = pools.map(pool => pool.address);

  const [
    { rewardPerSecond, totalAllocPoint },
    { balances, allocPoints, rewardPerSecs, rewardAllocPoints, rewarderTotalAllocPoints },
    tradingAprs,
  ] = await Promise.all([
    getMasterChefData(),
    getPoolsData(pools),
    getTradingFeeApr(spookyClient, pairAddresses, liquidityProviderFee),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const beefyPerformanceFee = pool.beefyFee ? pool.beefyFee : 0.095;
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards =
      totalAllocPoint > 0
        ? rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint)
        : new BigNumber(0);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (pool.oracleB && !rewardPerSecs[i].isNaN()) {
      let rewardBPerSec = rewardPerSecs[i]
        .times(rewardAllocPoints[i])
        .dividedBy(pool.rewarderTotalAllocPoints ?? rewarderTotalAllocPoints[i]);
      const rewardPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = rewardBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
      yearlyRewardsBInUsd = yearlyRewardsB.times(rewardPriceB).dividedBy(pool.decimalsB);
    }

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(
      simpleApy,
      tradingApr,
      BASE_HPY,
      1,
      shareAfterBeefyPerformanceFee
    );
    // console.log(pool.name, simpleApy.valueOf(), tradingApr.valueOf(), totalApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: totalApy };

    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: liquidityProviderFee,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };

    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, SpookyChefV2, FANTOM_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.booPerSecond().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, SpookyChefV2, FANTOM_CHAIN_ID);
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];
  const rewarderTotalAllocPointCalls = [];
  const rewardPerSecCalls = [];
  const rewardAllocPointCalls = [];

  pools.forEach(pool => {
    let tokenContract = fetchContract(pool.address, ERC20Abi, FANTOM_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    rewarderCalls.push(masterchefContract.read.rewarder([pool.poolId]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(poolInfoCalls),
    Promise.all(rewarderCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v['2'].toString()));
  const rewarders = res[2].map(v => v);

  for (let i = 0; i < pools.length; i++) {
    let rewarderContract = fetchContract(rewarders[i], SpookyComplexRewarder, FANTOM_CHAIN_ID);
    rewardPerSecCalls.push(rewarderContract.read.rewardPerSecond().catch(_ => NaN));
    rewardAllocPointCalls.push(
      rewarderContract.read
        .poolInfo([pools[i].poolId])
        .catch(_ => undefined)
        .then(v => new BigNumber(v[2].toString()))
        .catch(_ => NaN)
    );
    rewarderTotalAllocPointCalls.push(rewarderContract.read.totalAllocPoint().catch(_ => NaN));
  }

  const rewarderData = await Promise.all([
    Promise.all(rewardPerSecCalls),
    Promise.all(rewardAllocPointCalls),
    Promise.all(rewarderTotalAllocPointCalls),
  ]);

  const rewardPerSecs = rewarderData[0].map(v => new BigNumber(v.toString()));
  const rewardAllocPoints = rewarderData[1];
  const rewarderTotalAllocPoints = rewarderData[2].map(v => new BigNumber(v.toString()));

  return { balances, allocPoints, rewardPerSecs, rewardAllocPoints, rewarderTotalAllocPoints };
};

module.exports = getSpookyV3LpApys;
