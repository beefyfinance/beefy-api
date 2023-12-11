const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/avax/joeBoostedLpPools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprSushi } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { joeClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { JOE_LPF } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import SimpleRewarderPerSec from '../../../abis/avax/SimpleRewarderPerSec';
import BoostedMasterChefJoe from '../../../abis/avax/BoostedMasterChefJoe';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const JOESTAKER = '0x8330C83583829074BA6FF96b4A6377966D80edbf';
const masterchef = '0x4483f0b6e2F5486D06958C20f8C39A7aBe87bf8F';
const oracleIdA = 'JOE';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = JOE_LPF;

const getJoeBoostedLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const pairAddresses = pools.map(pool => pool.address);

  const [
    { joePerSec, totalAllocPoint },
    { balances, allocPoints, tokenPerSecData, veJoeShareBps, totalFactors, userFactors },
    tradingAprs,
  ] = await Promise.all([
    getMasterChefData(),
    getPoolsData(pools),
    getTradingFeeAprSushi(joeClient, pairAddresses, liquidityProviderFee),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });

    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');
    const veJoeShare = veJoeShareBps[i] / 10000;

    const poolBlockRewardsBase = joePerSec
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint)
      .times(1 - veJoeShare);
    const poolBlockRewardsBoost = joePerSec
      .times(userFactors[i])
      .times(veJoeShare)
      .dividedBy(totalFactors[i]);
    const yearlyRewards = poolBlockRewardsBase
      .plus(poolBlockRewardsBoost)
      .dividedBy(secondsPerBlock)
      .times(secondsPerYear);

    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (!tokenPerSecData[i].isNaN()) {
      let tokenBPerSec = tokenPerSecData[i];
      const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
      yearlyRewardsBInUsd = yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
    }

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name) + 0.05; //  beefy fees + 0.05 Joe Boost Tax
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

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
  const masterchefContract = fetchContract(masterchef, BoostedMasterChefJoe, AVAX_CHAIN_ID);
  const [joePerSec, totalAllocPoint] = await Promise.all([
    masterchefContract.read.joePerSec().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { joePerSec, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, BoostedMasterChefJoe, AVAX_CHAIN_ID);
  const balanceCalls = [];
  const poolInfoCalls = [];
  const tokenPerSecCalls = [];
  const userInfoCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, AVAX_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    userInfoCalls.push(masterchefContract.read.userInfo([pool.poolId, JOESTAKER]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(poolInfoCalls),
    Promise.all(userInfoCalls),
  ]);
  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v[1].toString()));
  const rewarders = res[1].map(v => v[5]);
  const veJoeShareBps = res[1].map(v => v[6]);
  const totalFactors = res[1].map(v => new BigNumber(v[7]));
  const userFactors = res[2].map(v => new BigNumber(v[2]));

  rewarders.forEach(rewarder => {
    let rewarderContract = fetchContract(rewarder, SimpleRewarderPerSec, AVAX_CHAIN_ID);
    tokenPerSecCalls.push(
      rewarderContract.read
        .tokenPerSec()
        .catch(err => new BigNumber('NaN'))
        .then(v => new BigNumber(v.toString()))
    );
  });

  const tokenPerSecData = await Promise.all(tokenPerSecCalls);

  return {
    balances,
    allocPoints,
    tokenPerSecData,
    veJoeShareBps,
    totalFactors,
    userFactors,
  };
};

module.exports = getJoeBoostedLpApys;
