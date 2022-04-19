const BigNumber = require('bignumber.js');
const { moonriverWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/moonriver/FinnMasterChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/moonriver/finnPool.json');
const { BASE_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { getContractWithProvider } from '../../../utils/contractHelper';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { getYearlyPlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { finnClient } = require('../../../apollo/client');

const oracle = 'tokens';
const oracleId = 'FINN';
const masterchef = '0x1f4b7660b6AdC3943b5038e3426B33c1c0e343E6';
const xToken = '0x37619cC85325aFea778830e184CB60a3ABc9210B';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.0005;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getFinnApy = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balance, allocPoint } = await getPoolData();

  const tokenContract = getContractWithProvider(ERC20, pool.address, web3);
  const totalStakedInxToken = await tokenContract.methods.balanceOf(xToken).call();
  const totalStakedInxTokenInUsd = new BigNumber(totalStakedInxToken)
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
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.finnPerSecond().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolData = async () => {
  const xTokenContract = getContractWithProvider(ERC20, xToken, web3);
  const xBalance = await xTokenContract.methods.balanceOf(masterchef).call();
  const xTotalSupply = await xTokenContract.methods.totalSupply().call();

  const tokenContract = getContractWithProvider(ERC20, pool.address, web3);
  const tokensStakedInxToken = await tokenContract.methods.balanceOf(xToken).call();
  const balance = new BigNumber(xBalance).times(tokensStakedInxToken).dividedBy(xTotalSupply);

  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  const rewardPool = await masterchefContract.methods.poolInfo(pool.poolId).call();
  const allocPoint = new BigNumber(rewardPool.allocPoint);

  return { balance, allocPoint };
};

module.exports = getFinnApy;
