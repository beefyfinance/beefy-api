import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

import MiniChefV2 from '../../../abis/matic/ApeMiniApe.json';
import SushiComplexRewarderTime from '../../../abis/matic/SushiComplexRewarderTime.json';
import ERC20 from '../../../abis/ERC20.json';
import fetchPrice from '../../../utils/fetchPrice';
import pools from '../../../data/matic/apePolyLpPools.json';
import { POLYGON_CHAIN_ID, APEPOLY_LPF } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { apePolyClient } from '../../../apollo/client';
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

const getApeLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(apePolyClient, pairAddresses, APEPOLY_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, APEPOLY_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = new web3.eth.Contract(MiniChefV2, minichef);
  const bananaPerSecond = new BigNumber(await minichefContract.methods.bananaPerSecond().call());
  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());

  const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, complexRewarderTime);
  const rewardPerSecond = new BigNumber(await rewardContract.methods.rewardPerSecond().call());

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const maticPrice = await fetchPrice({ oracle, id: oracleIdMatic });
  const { balances, allocPoints, rewardAllocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = bananaPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const allocPoint = rewardAllocPoints[i];
    const maticRewards = rewardPerSecond.times(allocPoint).dividedBy(totalAllocPoint);
    const yearlyMaticRewards = maticRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const maticRewardsInUsd = yearlyMaticRewards.times(maticPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(maticRewardsInUsd).dividedBy(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), apy.valueOf());
  }
  return apys;
};

const getPoolsData = async pools => {
  const minichefContract = new web3.eth.Contract(MiniChefV2, minichef);
  const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, complexRewarderTime);

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(minichef),
    });
    allocPointCalls.push({
      allocPoint: minichefContract.methods.poolInfo(pool.poolId),
    });
    rewardAllocPointCalls.push({
      allocPoint: rewardContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls, rewardAllocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  const rewardAllocPoints = res[2].map(v => v.allocPoint['2']);
  return { balances, allocPoints, rewardAllocPoints };
};

module.exports = { getApeLpApys, APEPOLY_LPF };
