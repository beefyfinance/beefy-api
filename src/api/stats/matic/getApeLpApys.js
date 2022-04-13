const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MiniChefV2 = require('../../../abis/matic/ApeMiniApe.json');
const SushiComplexRewarderTime = require('../../../abis/matic/SushiComplexRewarderTime.json');
const RewarderAllocPoints = require('../../../abis/matic/RewarderAllocPoints.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/apePolyLpPools.json');
const { POLYGON_CHAIN_ID, APEPOLY_LPF } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { apePolyClient } = require('../../../apollo/client');
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
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
  const tradingAprs = await getTradingFeeApr(apePolyClient, pairAddresses, APEPOLY_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, APEPOLY_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = getContractWithProvider(MiniChefV2, minichef, web3);
  const bananaPerSecond = new BigNumber(await minichefContract.methods.bananaPerSecond().call());
  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const { balances, allocPoints, rewardAllocPoints, rewardPerSeconds, rewardTotalAllocPoints } =
    await getPoolsData(pools);
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
  const minichefContract = getContract(MiniChefV2, minichef);
  const totalPointContract = getContract(RewarderAllocPoints, rewarderAllocPoints);

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  const rewardPerSecondCalls = [];
  const rewardTotalPointCalls = [];
  pools.forEach(pool => {
    const rewardContract = getContract(
      SushiComplexRewarderTime,
      pool.rewarder ?? complexRewarderTime
    );
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(minichef),
    });
    allocPointCalls.push({
      allocPoint: minichefContract.methods.poolInfo(pool.poolId),
    });
    rewardAllocPointCalls.push({
      allocPoint: rewardContract.methods.poolInfo(pool.poolId),
    });
    rewardPerSecondCalls.push({
      rewardPerSecond: rewardContract.methods.rewardPerSecond(),
    });
    rewardTotalPointCalls.push({
      totalAllocPoint: totalPointContract.methods.totalAllocPoint(
        pool.rewarder ?? complexRewarderTime
      ),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([
    balanceCalls,
    allocPointCalls,
    rewardAllocPointCalls,
    rewardPerSecondCalls,
    rewardTotalPointCalls,
  ]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  const rewardAllocPoints = res[2].map(v => v.allocPoint['2']);
  const rewardPerSeconds = res[3].map(v => new BigNumber(v.rewardPerSecond));
  const rewardTotalAllocPoints = res[4].map(v => new BigNumber(v.totalAllocPoint));
  return { balances, allocPoints, rewardAllocPoints, rewardPerSeconds, rewardTotalAllocPoints };
};

module.exports = { getApeLpApys, APEPOLY_LPF };
