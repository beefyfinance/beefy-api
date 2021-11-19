const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const xBOOChefAbi = require('../../../abis/fantom/xBOOChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/fantom/spookySinglePool.json');
const { BASE_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { getYearlyPlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { spookyClient } = require('../../../apollo/client');

const oracle = 'tokens';
const oracleId = 'BOO';
const BOO = '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE';
const xBOOChefAddress = '0x2352b745561e7e6FCD03c093cE7220e3e126ace0';
const xBOO = '0xa48d959AE2E88f1dAA7D5F611E01908106dE7598';
const DECIMALS = '1e18';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.0003;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getSpookyBooApy = async () => {
  const BOOPrice = await fetchPrice({ oracle, id: oracleId });
  const { balance, rewardRate } = await getPoolData();

  const BOOContract = new web3.eth.Contract(ERC20, BOO);
  const totalStakedInxBOO = await BOOContract.methods.balanceOf(xBOO).call();
  const totalStakedInxBOOInUsd = new BigNumber(totalStakedInxBOO)
    .times(BOOPrice)
    .dividedBy(DECIMALS);

  const xBOOContract = new web3.eth.Contract(ERC20, xBOO);
  const xBOOTotalSupply = await xBOOContract.methods.totalSupply().call();
  const xBOOPrice = totalStakedInxBOOInUsd.dividedBy(xBOOTotalSupply).times(DECIMALS);

  const yearlyTradingFees = await getYearlyPlatformTradingFees(spookyClient, liquidityProviderFee);

  const totalStakedInUsd = balance.times(xBOOPrice).dividedBy(DECIMALS);

  const rewardPrice = await fetchPrice({ oracle, id: pool.rewardTokenName });
  const yearlyRewards = rewardRate.times(SECONDS_PER_YEAR);
  const yearlyRewardsInUsd = yearlyRewards.times(rewardPrice).dividedBy(pool.rewardDecimals);

  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
  const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const tradingApr = yearlyTradingFees.div(totalStakedInxBOOInUsd);
  const totalApy = getFarmWithTradingFeesApy(
    simpleApr,
    tradingApr,
    BASE_HPY,
    1,
    shareAfterBeefyPerformanceFee
  );
  const apys = { 'boo-boo': totalApy };

  // Create reference for breakdown /apy
  const apyBreakdowns = {
    'boo-boo': {
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

const getPoolData = async () => {
  const xBOOChef = new web3.eth.Contract(xBOOChefAbi, xBOOChefAddress);
  const rewardPool = await xBOOChef.methods.poolInfo(pool.poolId).call();
  const rewardRate = new BigNumber(rewardPool.RewardPerSecond);
  const balance = new BigNumber(rewardPool.xBooStakedAmount);

  return { balance, rewardRate };
};

module.exports = getSpookyBooApy;
