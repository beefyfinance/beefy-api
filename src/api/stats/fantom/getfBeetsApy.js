const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/fantom/BeethovenxChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/fantom/fBeetsPool.json');
const { BASE_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { getYearlyBalancerPlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { beetClient } = require('../../../apollo/client');
const getBlockTime = require('../../../utils/getBlockTime');

const oracle = 'tokens';
const oracleId = 'BEETS';
const masterchef = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const xToken = '0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.000375;
const liquidityProviderFeeShare = 0.15;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getfBeetsApy = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { rewardPerBlock, totalAllocPoint } = await getMasterChefData();
  const { balance, allocPoint } = await getPoolData();
  const secondsPerBlock = await getBlockTime(250);

  const tokenContract = new web3.eth.Contract(ERC20, pool[0].address);
  const totalStakedInxToken = await tokenContract.methods.balanceOf(xToken).call();
  const totalStakedInxTokenInUsd = new BigNumber(totalStakedInxToken)
    .times(tokenPrice)
    .dividedBy(pool[0].decimals);

  const yearlyTradingFees = await getYearlyBalancerPlatformTradingFees(
    beetClient,
    liquidityProviderFeeShare
  );
  const totalStakedInUsd = balance.times(tokenPrice).dividedBy(pool[0].decimals);

  const poolRewards = rewardPerBlock.times(allocPoint).dividedBy(totalAllocPoint);
  const yearlyRewards = poolRewards.times(SECONDS_PER_YEAR).dividedBy(secondsPerBlock);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool[0].decimals);

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
  const apys = { [pool[0].name]: totalApy };

  const apyBreakdowns = {
    [pool[0].name]: {
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
  const rewardPerBlock = new BigNumber(await masterchefContract.methods.beetsPerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerBlock, totalAllocPoint };
};

const getPoolData = async () => {
  const xTokenContract = new web3.eth.Contract(ERC20, xToken);
  const xBalance = await xTokenContract.methods.balanceOf(masterchef).call();
  const xTotalSupply = await xTokenContract.methods.totalSupply().call();

  const tokenContract = new web3.eth.Contract(ERC20, pool[0].address);
  const tokensStakedInxToken = await tokenContract.methods.balanceOf(xToken).call();
  const balance = new BigNumber(xBalance).times(tokensStakedInxToken).dividedBy(xTotalSupply);

  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPool = await masterchefContract.methods.poolInfo(pool[0].poolId).call();
  const allocPoint = new BigNumber(rewardPool.allocPoint);

  return { balance, allocPoint };
};

module.exports = getfBeetsApy;
