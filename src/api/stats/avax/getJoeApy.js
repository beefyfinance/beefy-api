const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/avax/JoeChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/avax/joePool.json');
const { BASE_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { getYearlyJoePlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { joeClient } = require('../../../apollo/client');

const oracle = 'tokens';
const oracleId = 'JOE';
const masterchef = '0xd6a4F121CA35509aF06A0Be99093d08462f53052';
const xToken = '0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.0005;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getJoeApy = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balance, allocPoint } = await getPoolData();

  const tokenContract = new web3.eth.Contract(ERC20, pool.address);
  const totalStakedInxToken = await tokenContract.methods.balanceOf(xToken).call();
  const totalStakedInxTokenInUsd = new BigNumber(totalStakedInxToken)
    .times(tokenPrice)
    .dividedBy(pool.decimals);

  const yearlyTradingFees = await getYearlyJoePlatformTradingFees(joeClient, liquidityProviderFee);
  const totalStakedInUsd = balance.times(tokenPrice).dividedBy(pool.decimals);

  const poolRewards = rewardPerSecond.times(allocPoint).dividedBy(totalAllocPoint);
  const yearlyRewards = poolRewards.times(SECONDS_PER_YEAR);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.decimals).dividedBy(2);

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
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.joePerSec().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolData = async () => {
  const xTokenContract = new web3.eth.Contract(ERC20, xToken);
  const xBalance = await xTokenContract.methods.balanceOf(masterchef).call();
  const xTotalSupply = await xTokenContract.methods.totalSupply().call();

  const tokenContract = new web3.eth.Contract(ERC20, pool.address);
  const tokensStakedInxToken = await tokenContract.methods.balanceOf(xToken).call();
  const balance = new BigNumber(xBalance).times(tokensStakedInxToken).dividedBy(xTotalSupply);

  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPool = await masterchefContract.methods.poolInfo(pool.poolId).call();
  const allocPoint = new BigNumber(rewardPool.allocPoint);

  return { balance, allocPoint };
};

module.exports = getJoeApy;
