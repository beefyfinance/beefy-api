const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/avax/joeLpPools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprSushi } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { JOE_LPF } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { fetchContract } from '../../rpc/client';
import JoeChef from '../../../abis/avax/JoeChef';
import ERC20Abi from '../../../abis/ERC20Abi';

const { joeClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');

const masterchef = '0xd6a4F121CA35509aF06A0Be99093d08462f53052';
const oracleId = 'JOE';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = JOE_LPF;

const getJoeApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const pairAddresses = pools.map(pool => pool.address);
  const [{ rewardPerSecond, totalAllocPoint }, { balances, allocPoints }, tradingAprs] =
    await Promise.all([
      getMasterChefData(),
      getPoolsData(pools),
      getTradingFeeAprSushi(joeClient, pairAddresses, liquidityProviderFee),
    ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS).dividedBy(2);

    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

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

    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, JoeChef, AVAX_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.joePerSec().then(v => new BigNumber(v)),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v)),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, JoeChef, AVAX_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, AVAX_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(allocPointCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v[1].toString()));
  return { balances, allocPoints };
};

module.exports = getJoeApys;
