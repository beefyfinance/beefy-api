const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { fantomWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/fantom/SpookyChefV2.json');
const ComplexRewarder = require('../../../abis/fantom/SpookyComplexRewarder.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/fantom/spookyV2LpPools.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { SPOOKY_LPF } from '../../../constants';

const { spookyClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0x18b4f774fdC7BF685daeeF66c2990b1dDd9ea6aD';
const oracleIdA = 'BOO';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = SPOOKY_LPF;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getSpookyV2LpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, rewardPerSecs, rewardAllocPoints, totalAllocPoints } =
    await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(spookyClient, pairAddresses, liquidityProviderFee);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards =
      totalAllocPoint > 0
        ? rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint)
        : new BigNumber(0);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (!rewardPerSecs[i].isNaN()) {
      let rewardBPerSec = rewardPerSecs[i]
        .times(rewardAllocPoints[i])
        .dividedBy(totalAllocPoints[i]);
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
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.booPerSecond().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(FANTOM_CHAIN_ID));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];
  const rewarderTotalAllocPointCalls = [];
  const rewardPerSecCalls = [];
  const rewardAllocPointCalls = [];
  const totalAllocPoints = [];

  pools.forEach(pool => {
    let tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    poolInfoCalls.push({
      poolInfo: masterchefContract.methods.poolInfo(pool.poolId),
    });
    rewarderCalls.push({
      rewarder: masterchefContract.methods.rewarder(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls, rewarderCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo['2']);
  const rewarders = res[2].map(v => v.rewarder);

  for (let i = 0; i < pools.length; i++) {
    let rewarderContract = new web3.eth.Contract(ComplexRewarder, rewarders[i]);
    let rewardPerSec = rewarderContract.methods.rewardPerSecond();
    let rewardAllocPoint = rewarderContract.methods.poolInfo(pools[i].poolId);

    rewardPerSecCalls.push({
      rewardPerSec: rewardPerSec,
    });
    rewardAllocPointCalls.push({
      rewardAllocPoint: rewardAllocPoint,
    });
  }

  const rewarderData = await multicall.all([rewardPerSecCalls, rewardAllocPointCalls]);

  const rewardPerSecs = rewarderData[0].map(v => new BigNumber(v.rewardPerSec));
  const rewardAllocPoints = rewarderData[1].map(v => new BigNumber(v.rewardAllocPoint['2']));

  // totalAllocPoint is not a public variable on the complex rewarder
  // find shared rewarders and sum their allocPoints
  for (let i = 0; i < rewarders.length; i++) {
    let sharedRewarder = rewarders.reduce(function (a, e, i) {
      if (e === rewarders[i]) a.push(i);
      return a;
    }, []);
    for (let j = 0; j < sharedRewarder.length; j++) {
      totalAllocPoints[i] =
        totalAllocPoints[i] > 0
          ? rewardAllocPoints[sharedRewarder[j]].plus(totalAllocPoints[i])
          : rewardAllocPoints[sharedRewarder[j]];
    }
  }

  return { balances, allocPoints, rewardPerSecs, rewardAllocPoints, totalAllocPoints };
};

module.exports = getSpookyV2LpApys;
