import { getFarmWithTradingFeesApy } from '../../../../utils/getFarmWithTradingFeesApy';
import { PCS_LPF } from '../../../../constants';
import { getTotalPerformanceFeeForVault } from '../../../vaults/getVaultFees';
import PcsMasterChefV2 from '../../../../abis/PcsMasterChefV2';
import { fetchContract } from '../../../rpc/client';
import ERC20Abi from '../../../../abis/ERC20Abi';

const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../../utils/fetchPrice';
const { compound } = require('../../../../utils/compound');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { cakeClient } = require('../../../../apollo/client');
const lpPools = require('../../../../data/cakeLpPoolsV2.json');
const stablePools = require('../../../../data/cakeStablePools.json').filter(p => p.poolId);

const masterchef = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
const oracle = 'tokens';
const oracleId = 'Cake';
const DECIMALS = '1e18';
const secondsPerBlock = 3;
const secondsPerYear = 31536000;

const pancakeLiquidityProviderFee = PCS_LPF;

export const getCakeLpV2Apys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pools = [...lpPools, ...stablePools.map(p => ({ ...p, address: p.token }))];
  const pairAddresses = pools.map(pool => pool.address);
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const [{ blockRewards, totalAllocPoint }, { balances, allocPoints }, tradingAprs] =
    await Promise.all([
      getMasterChefData(),
      getPoolsData(pools),
      getTradingFeeApr(cakeClient, pairAddresses, pancakeLiquidityProviderFee),
    ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = blockRewards.times(allocPoints[i]).dividedBy(totalAllocPoint);

    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    // console.log(pool.name, totalStakedInUsd.valueOf(), yearlyRewards.valueOf(), yearlyRewardsInUsd.valueOf(),  simpleApy.valueOf(), allocPoints[i].valueOf(), totalAllocPoint.valueOf(), poolBlockRewards.valueOf())
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
        lpFee: pancakeLiquidityProviderFee,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };
    // Add token to APYs object
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, PcsMasterChefV2, BSC_CHAIN_ID);
  const [blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.read.cakePerBlock([true]).then(res => new BigNumber(res.toString())),
    masterchefContract.read.totalRegularAllocPoint().then(res => new BigNumber(res.toString())),
  ]);
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, PcsMasterChefV2, BSC_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, BSC_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(allocPointCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v['2'].toString()));
  return { balances, allocPoints };
};
