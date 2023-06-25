const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/apePolyLpPools.json');
const { POLYGON_CHAIN_ID, APEPOLY_LPF } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { apePolyClient } = require('../../../apollo/client');
import ERC20Abi from '../../../abis/ERC20Abi';
import ApeMiniApe from '../../../abis/matic/ApeMiniApe';
import RewarderAllocPoints from '../../../abis/matic/RewarderAllocPoints';
import SushiComplexRewarderTime from '../../../abis/matic/SushiComplexRewarderTime';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';

const minichef = '0x54aff400858Dcac39797a81894D9920f16972D1D';
const oracleId = 'BANANApoly';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

// matic
const complexRewarderTime = '0x1F234B1b83e21Cb5e2b99b4E498fe70Ef2d6e3bf';
const oracleIdMatic = 'WMATIC';

const rewarderAllocPoints = '0x11Bd04123d0B8404685101791Dc01596EEd48570';

const getApeLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeApr(apePolyClient, pairAddresses, APEPOLY_LPF),
    getFarmApys(pools),
  ]);

  return getApyBreakdown(pools, tradingAprs, farmApys, APEPOLY_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = fetchContract(minichef, ApeMiniApe, POLYGON_CHAIN_ID);

  const [
    bananaPerSecond,
    totalAllocPoint,
    { balances, allocPoints, rewardAllocPoints, rewardPerSeconds, rewardTotalAllocPoints },
  ] = await Promise.all([
    minichefContract.read.bananaPerSecond().then(v => new BigNumber(v.toString())),
    minichefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
    getPoolsData(pools),
  ]);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = bananaPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const rewardPerSecond = rewardPerSeconds[i];
    const allocPoint = rewardAllocPoints[i];
    const rewardTotalAllocPoint = rewardTotalAllocPoints[i];
    const rewardPrice = await fetchPrice({ oracle, id: pool.rewarderOracleId ?? oracleIdMatic });
    const rewards = rewardPerSecond.times(allocPoint).dividedBy(rewardTotalAllocPoint);
    const yearlyMaticRewards = rewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const maticRewardsInUsd = yearlyMaticRewards.times(rewardPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(maticRewardsInUsd).dividedBy(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), apy.valueOf());
  }
  return apys;
};

const getPoolsData = async pools => {
  const minichefContract = fetchContract(minichef, ApeMiniApe, POLYGON_CHAIN_ID);
  const totalPointContract = fetchContract(
    rewarderAllocPoints,
    RewarderAllocPoints,
    POLYGON_CHAIN_ID
  );

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  const rewardPerSecondCalls = [];
  const rewardTotalPointCalls = [];
  pools.forEach(pool => {
    const rewardContract = fetchContract(
      pool.rewarder ?? complexRewarderTime,
      SushiComplexRewarderTime,
      POLYGON_CHAIN_ID
    );
    const tokenContract = fetchContract(pool.address, ERC20Abi, POLYGON_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([minichef]));
    allocPointCalls.push(minichefContract.read.poolInfo([pool.poolId]));
    rewardAllocPointCalls.push(rewardContract.read.poolInfo([pool.poolId]));
    rewardPerSecondCalls.push(rewardContract.read.rewardPerSecond());
    rewardTotalPointCalls.push(
      totalPointContract.read.totalAllocPoint([pool.rewarder ?? complexRewarderTime])
    );
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(rewardAllocPointCalls),
    Promise.all(rewardPerSecondCalls),
    Promise.all(rewardTotalPointCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v['2'].toString()));
  const rewardAllocPoints = res[2].map(v => new BigNumber(v['2'].toString()));
  const rewardPerSeconds = res[3].map(v => new BigNumber(v.toString()));
  const rewardTotalAllocPoints = res[4].map(v => new BigNumber(v.toString()));
  return { balances, allocPoints, rewardAllocPoints, rewardPerSeconds, rewardTotalAllocPoints };
};

module.exports = { getApeLpApys, APEPOLY_LPF };
