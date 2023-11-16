const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/fantom/steakhouseLpPools.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import ERC20Abi from '../../../abis/ERC20Abi';
import SteakHouse from '../../../abis/fantom/SteakHouse';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const { spookyClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0x5bC37CAAA3b490b65F5A50E2553f4312126A8b7e';
const oracleId = 'SCREAM';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const spookyLiquidityProviderFee = 0.002;

const getSteakHouseLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const pairAddresses = pools.map(pool => pool.address);

  const [{ rewardPerSecond, totalAllocPoint }, { balances }, tradingAprs] = await Promise.all([
    getMasterChefData(),
    getPoolsData(pools),
    getTradingFeeApr(spookyClient, pairAddresses, spookyLiquidityProviderFee),
  ]);

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
  const masterchefContract = fetchContract(masterchef, SteakHouse, FANTOM_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.RewardsPerSecond([3]).then(res => new BigNumber(res.toString())),
    masterchefContract.read.totalAllocPoints([3]).then(res => new BigNumber(res.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const balanceCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, FANTOM_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
  });

  const res = await Promise.all(balanceCalls);

  const balances = res.map(v => new BigNumber(v.toString()));
  return { balances };
};

module.exports = getSteakHouseLpApys;
