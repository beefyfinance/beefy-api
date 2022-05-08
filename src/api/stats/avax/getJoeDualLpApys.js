const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { avaxWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/avax/MasterChefJoeV3.json');
const SimpleRewarder = require('../../../abis/avax/SimpleRewarderPerSec.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/avax/joeDualLpPools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprSushi } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { joeClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { JOE_LPF } from '../../../constants';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';

const masterchef = '0x188bED1968b795d5c9022F6a0bb5931Ac4c18F00';
const oracleIdA = 'JOE';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = JOE_LPF;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getJoeDualLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, tokenPerSecData } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprSushi(joeClient, pairAddresses, liquidityProviderFee);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
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
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.joePerSec().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = getContract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(AVAX_CHAIN_ID));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const tokenPerSecCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    let poolInfo = masterchefContract.methods.poolInfo(pool.poolId);
    poolInfoCalls.push({
      poolInfo: poolInfo,
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo['3']);
  const rewarders = res[1].map(v => v.poolInfo[4]);

  rewarders.forEach(rewarder => {
    let rewarderContract = getContract(SimpleRewarder, rewarder);
    let tokenPerSec = rewarderContract.methods.tokenPerSec();
    tokenPerSecCalls.push({
      tokenPerSec: tokenPerSec,
    });
  });

  const tokenPerSecData = (await multicall.all([tokenPerSecCalls]))[0].map(
    t => new BigNumber(t.tokenPerSec)
  );

  return { balances, allocPoints, tokenPerSecData };
};

module.exports = getJoeDualLpApys;
