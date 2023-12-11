const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pool = require('../../../data/moonriver/finnPool.json');
const { BASE_HPY, MOONRIVER_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import ERC20Abi from '../../../abis/ERC20Abi';
import FinnMasterChef from '../../../abis/moonriver/FinnMasterChef';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const { getYearlyPlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { finnClient } = require('../../../apollo/client');

const oracle = 'tokens';
const oracleId = 'FINN';
const masterchef = '0x1f4b7660b6AdC3943b5038e3426B33c1c0e343E6';
const xToken = '0x37619cC85325aFea778830e184CB60a3ABc9210B';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.0005;

const getFinnApy = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const tokenContract = fetchContract(pool.address, ERC20Abi, MOONRIVER_CHAIN_ID);

  const [totalStakedInxToken, { rewardPerSecond, totalAllocPoint }, { balance, allocPoint }] =
    await Promise.all([tokenContract.read.balanceOf([xToken]), getMasterChefData(), getPoolData()]);

  const totalStakedInxTokenInUsd = new BigNumber(totalStakedInxToken.toString())
    .times(tokenPrice)
    .dividedBy(pool.decimals);

  // http 502
  // const yearlyTradingFees = await getYearlyPlatformTradingFees(finnClient, liquidityProviderFee);
  const yearlyTradingFees = new BigNumber(0);
  const totalStakedInUsd = balance.times(tokenPrice).dividedBy(pool.decimals);

  const poolRewards = rewardPerSecond.times(allocPoint).dividedBy(totalAllocPoint);
  const yearlyRewards = poolRewards.times(SECONDS_PER_YEAR);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.decimals);

  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
  const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const tradingApr = yearlyTradingFees.div(totalStakedInxTokenInUsd);
  const totalApy = getFarmWithTradingFeesApy(
    simpleApr,
    tradingApr,
    BASE_HPY,
    1,
    shareAfterBeefyPerformanceFee
  );
  const apys = { [pool.name]: totalApy };

  const apyBreakdowns = {
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

  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, FinnMasterChef, MOONRIVER_CHAIN_ID);
  const res = await Promise.all([
    masterchefContract.read.finnPerSecond(),
    masterchefContract.read.totalAllocPoint(),
  ]);
  const rewardPerSecond = new BigNumber(res[0].toString());
  const totalAllocPoint = new BigNumber(res[1].toString());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolData = async () => {
  const xTokenContract = fetchContract(xToken, ERC20Abi, MOONRIVER_CHAIN_ID);
  const tokenContract = fetchContract(pool.address, ERC20Abi, MOONRIVER_CHAIN_ID);
  const masterchefContract = fetchContract(masterchef, FinnMasterChef, MOONRIVER_CHAIN_ID);

  const res = await Promise.all([
    xTokenContract.read.balanceOf([masterchef]),
    xTokenContract.read.totalSupply(),
    tokenContract.read.balanceOf([xToken]),
    masterchefContract.read.poolInfo([pool.poolId]),
  ]);

  const xBalance = new BigNumber(res[0].toString());
  const xTotalSupply = new BigNumber(res[1].toString());
  const tokensStakedInxToken = new BigNumber(res[2].toString());
  const allocPoint = new BigNumber(res[3][1].toString());

  const balance = new BigNumber(xBalance).times(tokensStakedInxToken).dividedBy(xTotalSupply);

  return { balance, allocPoint };
};

module.exports = getFinnApy;
