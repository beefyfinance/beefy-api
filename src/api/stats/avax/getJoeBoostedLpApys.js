const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { avaxWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/avax/BoostedMasterChefJoe.json');
const SimpleRewarder = require('../../../abis/avax/SimpleRewarderPerSec.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/avax/joeBoostedLpPools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprSushi } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { joeClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { JOE_LPF } from '../../../constants';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';

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
  const { joePerSec, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, tokenPerSecData, veJoeShareBps, totalFactors, userFactors } =
    await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprSushi(joeClient, pairAddresses, liquidityProviderFee);

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
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  const joePerSec = new BigNumber(await masterchefContract.methods.joePerSec().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { joePerSec, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = getContract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(AVAX_CHAIN_ID));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const tokenPerSecCalls = [];
  const userInfoCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    let poolInfo = masterchefContract.methods.poolInfo(pool.poolId);
    poolInfoCalls.push({
      poolInfo: poolInfo,
    });
    let userInfo = masterchefContract.methods.userInfo(pool.poolId, JOESTAKER);
    userInfoCalls.push({
      userInfo: userInfo,
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls, userInfoCalls]);
  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo[1]);
  const rewarders = res[1].map(v => v.poolInfo[5]);
  const veJoeShareBps = res[1].map(v => v.poolInfo[6]);
  const totalFactors = res[1].map(v => v.poolInfo[7]);
  const userFactors = res[2].map(v => v.userInfo[2]);

  rewarders.forEach(rewarder => {
    let rewarderContract = getContractWithProvider(SimpleRewarder, rewarder, web3);
    let tokenPerSec = rewarderContract.methods.tokenPerSec();
    tokenPerSecCalls.push({
      tokenPerSec: tokenPerSec,
    });
  });

  const tokenPerSecData = (await multicall.all([tokenPerSecCalls]))[0].map(
    t => new BigNumber(t.tokenPerSec)
  );

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
