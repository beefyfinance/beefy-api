const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { avaxWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/avax/PangolinChef.json');
const Rewarder = require('../../../abis/avax/PangolinRewarderViaMultiplier.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/avax/pangolinV2DualLpPools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { pangolinClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928';
const oracleIdA = 'PNG';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerYear = 31536000;

const liquidityProviderFee = 0.0025;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getPangolinV2DualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, multipliers } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(pangolinClient, pairAddresses, liquidityProviderFee);

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
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.rewardPerSecond().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = getContract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(AVAX_CHAIN_ID));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];
  const multipliersCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    let poolInfo = masterchefContract.methods.poolInfo(pool.poolId);
    poolInfoCalls.push({
      poolInfo: poolInfo,
    });
    let rewarder = masterchefContract.methods.rewarder(pool.poolId);
    rewarderCalls.push({
      rewarder: rewarder,
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls, rewarderCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo[2]);
  const rewarders = res[2].map(v => v.rewarder);

  rewarders.forEach(rewarder => {
    let rewarderContract = getContract(Rewarder, rewarder);
    let multiplier = rewarderContract.methods.getRewardMultipliers();
    multipliersCalls.push({
      multiplier: multiplier,
    });
  });

  const multipliers = (await multicall.all([multipliersCalls]))[0].map(m =>
    m.multiplier.map(v => new BigNumber(v))
  );

  return { balances, allocPoints, multipliers };
};

module.exports = getPangolinV2DualApys;
