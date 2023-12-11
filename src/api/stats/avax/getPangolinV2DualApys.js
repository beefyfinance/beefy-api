const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/avax/pangolinV2DualLpPools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import ERC20Abi from '../../../abis/ERC20Abi';
import PangolinChef from '../../../abis/avax/PangolinChef';
import PangolinRewarderViaMultiplier from '../../../abis/avax/PangolinRewarderViaMultiplier';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const { pangolinClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928';
const oracleIdA = 'PNG';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerYear = 31536000;

const liquidityProviderFee = 0.0025;

const getPangolinV2DualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const pairAddresses = pools.map(pool => pool.address);
  const [
    { rewardPerSecond, totalAllocPoint },
    { balances, allocPoints, multipliers },
    tradingAprs,
  ] = await Promise.all([
    getMasterChefData(),
    getPoolsData(pools),
    getTradingFeeApr(pangolinClient, pairAddresses, liquidityProviderFee),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const relativeRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = relativeRewards.times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);
    let yearlyRewardsCInUsd = new BigNumber(0);

    if (multipliers[i][0] != null) {
      let multiplier = multipliers[i][0];
      const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = yearlyRewards.times(multiplier).dividedBy(DECIMALSA);
      yearlyRewardsBInUsd = yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
    }
    if (multipliers[i][1] != null) {
      let multiplier = multipliers[i][1];
      const tokenPriceC = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdC });
      const yearlyRewardsC = yearlyRewards.times(multiplier).dividedBy(DECIMALSA);
      yearlyRewardsCInUsd = yearlyRewardsC.times(tokenPriceC).dividedBy(pool.decimalsC);
    }

    const yearlyRewardsInUsd = yearlyRewardsAInUsd
      .plus(yearlyRewardsBInUsd)
      .plus(yearlyRewardsCInUsd);

    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

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
  const masterchefContract = fetchContract(masterchef, PangolinChef, AVAX_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.rewardPerSecond().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, PangolinChef, AVAX_CHAIN_ID);
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, AVAX_CHAIN_ID);
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
  const allocPoints = res[1].map(v => new BigNumber(v[2].toString()));
  const rewarders = res[2];

  const multipliersCalls = [];
  rewarders.forEach(rewarder => {
    let rewarderContract = fetchContract(rewarder, PangolinRewarderViaMultiplier, AVAX_CHAIN_ID);
    multipliersCalls.push(
      rewarderContract.read
        .getRewardMultipliers()
        .then(v => v.map(m => new BigNumber(m.toString())))
    );
  });

  const multipliers = await multipliersCalls;

  return { balances, allocPoints, multipliers };
};

module.exports = getPangolinV2DualApys;
