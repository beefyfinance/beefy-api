const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const FairLaunch = require('../../../abis/matic/KyberFairLaunch.json');
const DMMPool = require('../../../abis/matic/DMMPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/kyberLpPools.json');
const { BASE_HPY, POLYGON_CHAIN_ID } = require('../../../constants');
const { getVariableTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { kyberClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const fairlaunch = '0x7EB05d3115984547a50Ff0e2d247fB6948E1c252';
const oracleId = 'AUR';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 2;
const secondsPerYear = 31536000;

const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getKyberLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, rewardPerBlocks, tradingFees } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => (pool.lp0.address).concat("_", pool.lp1.address));
  const tradingAprs = await getVariableTradingFeeApr(
    kyberClient,
    pairAddresses,
    tradingFees,
  );

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerBlocks[i];
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    const tradingApr = tradingAprs[(pool.lp0.address).concat("_", pool.lp1.address).toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(
      simpleApy,
      tradingApr,
      BASE_HPY,
      1,
      shareAfterBeefyPerformanceFee
    );
    // console.log(pool.name, simpleApy.valueOf(), tradingApr.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: totalApy };
    // Add token to Spooky APYs object
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: tradingFees[i],
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };
    // Add token to Spooky APYs object
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getPoolsData = async pools => {
  const fairLaunchContract = new web3.eth.Contract(FairLaunch, fairlaunch);
  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const rewardPerBlocksCalls = [];
  const tradingFeeCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(DMMPool, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(fairlaunch),
    });
    rewardPerBlocksCalls.push({
      rewardPerBlock: fairLaunchContract.methods.getPoolInfo(pool.poolId),
    });
    tradingFeeCalls.push({
      tradingFee: tokenContract.methods.getTradeInfo(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardPerBlocksCalls, tradingFeeCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardPerBlocks = res[1].map(v => new BigNumber(v.rewardPerBlock['5']));
  const tradingFees = res[2].map(v => new BigNumber(v.tradingFee['4']).dividedBy(DECIMALS));
  return { balances, rewardPerBlocks, tradingFees };
};

module.exports = getKyberLpApys;
