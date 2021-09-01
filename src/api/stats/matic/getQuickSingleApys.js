const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const IDragonsLair = require('../../../abis/IDragonsLair.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/quickPools.json');
const { POLYGON_CHAIN_ID, BASE_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { getYearlyPlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { quickClient } = require('../../../apollo/client');

const oracle = 'tokens';
const stakedOracleId = 'QUICK';
const STAKED_DECIMALS = '1e18';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.0004;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getQuickSingleApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const quickPrice = await fetchPrice({ oracle, id: stakedOracleId });
  const { balances, rewardRates } = await getPoolsData(pools);

  const tokenContract = new web3.eth.Contract(ERC20, pools[0].address);
  const totalStakedInDragonsLair = await tokenContract.methods
    .balanceOf(pools[0].dragonsLair)
    .call();
  const totalStakedInDragonsLairInUsd = new BigNumber(totalStakedInDragonsLair)
    .times(quickPrice)
    .dividedBy(STAKED_DECIMALS);
  const yearlyTradingFees = await getYearlyPlatformTradingFees(quickClient, liquidityProviderFee);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const totalStakedInUsd = balances[i].times(quickPrice).dividedBy(STAKED_DECIMALS);

    const tokenPrice = await fetchPrice({ oracle, id: pool.rewardToken });
    const yearlyRewards = rewardRates[i].times(SECONDS_PER_YEAR);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.rewardDecimals);

    const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
    const tradingApr = yearlyTradingFees.div(totalStakedInDragonsLairInUsd);
    const totalApy = getFarmWithTradingFeesApy(
      simpleApr,
      tradingApr,
      BASE_HPY,
      1,
      shareAfterBeefyPerformanceFee
    );
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

  return {
    apys,
    apyBreakdowns,
  };
};

const getPoolsData = async pools => {
  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(IDragonsLair, pool.dragonsLair);
    balanceCalls.push({
      balance: tokenContract.methods.QUICKBalance(pool.rewardPool),
    });
    const rewardPool = new web3.eth.Contract(IRewardPool, pool.rewardPool);
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRate(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  return { balances, rewardRates };
};

module.exports = getQuickSingleApys;
