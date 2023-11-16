const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/cronos/ripaeLpPools.json');
const { BASE_HPY, CRONOS_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { vvsClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import RipaeRewardPool from '../../../abis/cronos/RipaeRewardPool';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const masterchef = '0x83EA9d8748A7AD9f2F12B2A2F7a45CE47A862ac9';
const oracleId = 'sCRO';
const oracle = 'tokens';
const DECIMALS = '1e18';

const secondsPerYear = 31536000;

const liquidityProviderFee = 0.003;

const getRipaeApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const secondsPerBlock = 1;
  const tokenPrice = await fetchPrice({ oracle: oracle, id: oracleId });
  const pairAddresses = pools.map(pool => pool.address);

  const [{ rewardPerSecond, totalAllocPoint }, { balances, allocPoints }, tradingAprs] =
    await Promise.all([
      getMasterChefData(),
      getPoolsData(pools),
      getTradingFeeApr(vvsClient, pairAddresses, liquidityProviderFee),
    ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
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

    const legacyApyValue = { [pool.name]: totalApy };

    apys = { ...apys, ...legacyApyValue };

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

  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, RipaeRewardPool, CRONOS_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.rewardPerSecond([0]).then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, RipaeRewardPool, CRONOS_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, CRONOS_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(allocPointCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v['1'].toString()));
  return { balances, allocPoints };
};

module.exports = getRipaeApys;
