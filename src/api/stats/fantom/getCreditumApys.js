import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';
import lpPools from '../../../data/fantom/creditumPools.json';
import { BASE_HPY, FANTOM_CHAIN_ID, SPOOKY_LPF as liquidityProviderFee } from '../../../constants';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { spookyClient } from '../../../apollo/client';
import { compound } from '../../../utils/compound';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import SteakHouse from '../../../abis/fantom/SteakHouse';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const masterchef = '0xe0c43105235C1f18EA15fdb60Bb6d54814299938';
const rewardToken = 'CREDIT';
const rewardDecimals = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;
const curvePool = '0x96059756980fF6ced0473898d26F0EF828a59820';

const getCreditumApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pairAddresses = lpPools.map(pool => pool.address);
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
  const [
    curveTradingAprs,
    lpTradingAprs,
    { rewardPerSecond, totalAllocPoint },
    { balances, allocPoints },
  ] = await Promise.all([
    getCurveFactoryApy(curvePool, 'https://api.curve.fi/api/getFactoryAPYs-fantom'),
    getTradingFeeApr(spookyClient, pairAddresses, liquidityProviderFee),
    getMasterChefData(),
    getPoolsData(pools),
  ]);
  const tradingAprs = { ...curveTradingAprs, ...lpTradingAprs };

  const rewardTokenPrice = await fetchPrice({ oracle: 'tokens', id: rewardToken });

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
  const masterchefContract = fetchContract(masterchef, SteakHouse, FANTOM_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.RewardsPerSecond([0]).then(res => new BigNumber(res.toString())),
    masterchefContract.read.totalAllocPoints([0]).then(res => new BigNumber(res.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, SteakHouse, FANTOM_CHAIN_ID);
  const balanceCalls = [];
  const poolInfos = [];

  for (let i = 0; i < pools.length; i++) {
    const tokenContract = fetchContract(pools[i].address, ERC20Abi, FANTOM_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfos.push(masterchefContract.read.getPoolInfo([pools[i].poolId]));
  }

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(poolInfos)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v.AllocPoints[0].toString()));

  return { balances, allocPoints };
};

module.exports = getCreditumApys;
