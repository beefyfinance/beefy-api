const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/cronos/vvsDualLpPools.json');
const { BASE_HPY, CRONOS_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { vvsClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import getBlockTime from '../../../utils/getBlockTime';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import Craftsman from '../../../abis/cronos/Craftsman';
import CraftsmanV2 from '../../../abis/cronos/CraftsmanV2';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import VVSRewarder from '../../../abis/cronos/VVSRewarder';

const masterchef = '0xDccd6455AE04b03d785F12196B492b18129564bc';
const masterchefV2 = '0xbc149c62EFe8AFC61728fC58b1b66a0661712e76';
const oracleIdA = 'VVS';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerYear = 31536000;

const liquidityProviderFee = 0.003;

const getVvsDualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const pairAddresses = pools.map(pool => pool.address);

  const [
    secondsPerBlock,
    { rewardPerSecond, totalAllocPoint },
    { balances, allocPoints, tokenPerSecData, rewardEndData },
    tradingAprs,
  ] = await Promise.all([
    getBlockTime(CRONOS_CHAIN_ID),
    getMasterChefData(),
    getPoolsData(pools),
    getTradingFeeApr(vvsClient, pairAddresses, liquidityProviderFee),
  ]);
  const currentTimestamp = new BigNumber(Math.floor(Date.now() / 1000));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (!tokenPerSecData[i].isNaN() && rewardEndData[i].isGreaterThan(currentTimestamp)) {
      let tokenBPerSec = tokenPerSecData[i];
      const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = tokenBPerSec.times(secondsPerYear);
      yearlyRewardsBInUsd = yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
    }

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
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

    const legacyApyValue = { [pool.name]: totalApy };

    apys = { ...apys, ...legacyApyValue };

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

  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, Craftsman, CRONOS_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.vvsPerBlock().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, Craftsman, CRONOS_CHAIN_ID);
  const masterchefV2Contract = fetchContract(masterchefV2, CraftsmanV2, CRONOS_CHAIN_ID);
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, CRONOS_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    rewarderCalls.push(masterchefV2Contract.read.poolRewarders([pool.poolId]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(poolInfoCalls),
    Promise.all(rewarderCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v[1].toString()));
  const rewarders = res[2].map(v => v[0]);

  const tokenPerSecCalls = [];
  const rewardEndCalls = [];
  rewarders.forEach(rewarder => {
    let rewarderContract = fetchContract(rewarder, VVSRewarder, CRONOS_CHAIN_ID);

    rewardEndCalls.push(rewarderContract.read.rewardEndTimestamp());
    tokenPerSecCalls.push(rewarderContract.read.rewardPerSecond());
  });

  const resRewards = await Promise.all([
    Promise.all(rewardEndCalls),
    Promise.all(tokenPerSecCalls),
  ]);

  const rewardEndData = resRewards[0].map(t => new BigNumber(t.toString()));
  const tokenPerSecData = resRewards[1].map(t => new BigNumber(t.toString()));

  return { balances, allocPoints, tokenPerSecData, rewardEndData };
};

module.exports = getVvsDualApys;
