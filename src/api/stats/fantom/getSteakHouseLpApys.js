const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { fantomWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/fantom/SteakHouse.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/fantom/steakhouseLpPools.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { spookyClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0x5bC37CAAA3b490b65F5A50E2553f4312126A8b7e';
const oracleId = 'SCREAM';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const spookyLiquidityProviderFee = 0.002;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getSteakHouseLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(
    spookyClient,
    pairAddresses,
    spookyLiquidityProviderFee
  );

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(1000).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards
      .dividedBy(secondsPerBlock)
      .times(secondsPerYear)
      .times(0.9);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

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
        lpFee: spookyLiquidityProviderFee,
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

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPerSecond = new BigNumber(
    await masterchefContract.methods.RewardsPerSecond(3).call()
  );
  const totalAllocPoint = new BigNumber(
    await masterchefContract.methods.totalAllocPoints(3).call()
  );
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(FANTOM_CHAIN_ID));
  const balanceCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
  });

  const res = await multicall.all([balanceCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  return { balances };
};

module.exports = getSteakHouseLpApys;
