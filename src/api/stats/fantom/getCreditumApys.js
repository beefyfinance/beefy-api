import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { fantomWeb3 as web3, multicallAddress } from '../../../utils/web3';

import MasterChefAbi from '../../../abis/fantom/SteakHouse.json';
import ERC20 from '../../../abis/ERC20.json';
import fetchPrice from '../../../utils/fetchPrice';
import lpPools from '../../../data/fantom/creditumPools.json';
import {
  BASE_HPY,
  FANTOM_CHAIN_ID as chainId,
  SPOOKY_LPF as liquidityProviderFee,
  BEEFY_PERFORMANCE_FEE as beefyPerformanceFee,
  SHARE_AFTER_PERFORMANCE_FEE as shareAfterBeefyPerformanceFee,
} from '../../../constants';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { spookyClient } from '../../../apollo/client';
import { compound } from '../../../utils/compound';

const masterchef = '0xe0c43105235C1f18EA15fdb60Bb6d54814299938';
const rewardToken = 'CREDIT';
const rewardDecimals = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;
const curvePool = '0x96059756980fF6ced0473898d26F0EF828a59820';

const getCreditumApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const curveTradingAprs = await getCurveFactoryApy(
    curvePool,
    'https://api.curve.fi/api/getFactoryAPYs-fantom'
  );
  const pairAddresses = lpPools.map(pool => pool.address);
  const lpTradingAprs = await getTradingFeeApr(spookyClient, pairAddresses, liquidityProviderFee);
  const tradingAprs = { ...curveTradingAprs, ...lpTradingAprs };

  const pools = [
    ...lpPools,
    {
      name: 'credit-cusd-crv',
      poolId: 0,
      address: curvePool,
      oracle: 'lps',
      oracleId: 'curve-ftm-cusd',
      decimals: '1e18',
    },
  ];

  const rewardTokenPrice = await fetchPrice({ oracle: 'tokens', id: rewardToken });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints } = await getPoolsData(pools);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({
      oracle: 'lps',
      id: i == pools.length - 1 ? pool.oracleId : pool.name,
    });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy(pool.decimals);

    const yearlyRewards = rewardPerSecond
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint)
      .times(secondsPerYear)
      .times(0.9); // 10% of rewards go to xCREDIT holders
    const yearlyRewardsInUsd = yearlyRewards.times(rewardTokenPrice).dividedBy(rewardDecimals);

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
    // Add token to APYs object
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
    // Add token to APYs object
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChefAbi, masterchef);
  const rewardPerSecond = new BigNumber(
    await masterchefContract.methods.RewardsPerSecond(0).call()
  );
  const totalAllocPoint = new BigNumber(
    await masterchefContract.methods.totalAllocPoints(0).call()
  );
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChefAbi, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const balanceCalls = [];
  const poolInfos = [];

  for (let i = 0; i < pools.length; i++) {
    const tokenContract = new web3.eth.Contract(ERC20, pools[i].address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    poolInfos.push(await masterchefContract.methods.getPoolInfo(pools[i].poolId).call());
  }

  const res = await multicall.all([balanceCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = poolInfos.map(v => new BigNumber(v['AllocPoints'][0]));

  console.log('balances: ' + balances);
  console.log('allocPoints: ' + allocPoints);

  return { balances, allocPoints };
};

module.exports = getCreditumApys;
