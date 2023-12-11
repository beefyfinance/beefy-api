const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/metis/netswapLpPools.json');
const { BASE_HPY, METIS_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { netswapClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { NET_LPF } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import NettChef from '../../../abis/metis/NettChef';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import SimpleRewarderPerSec from '../../../abis/avax/SimpleRewarderPerSec';

const masterchef = '0x9d1dbB49b2744A1555EDbF1708D64dC71B0CB052';
const oracleIdA = 'NETT';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = NET_LPF;

const getNetswapApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, tokenPerSecData } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(netswapClient, pairAddresses, liquidityProviderFee);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (!tokenPerSecData[i].isNaN()) {
      let tokenBPerSec = tokenPerSecData[i];
      const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
      yearlyRewardsBInUsd = yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
    }

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

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
    // console.log(pool.name, simpleApy.valueOf(), tradingApr.valueOf(), totalApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

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
  const masterchefContract = fetchContract(masterchef, NettChef, METIS_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.nettPerSec().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, NettChef, METIS_CHAIN_ID);
  const balanceCalls = [];
  const poolInfoCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, METIS_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(poolInfoCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v[1].toString()));
  const rewarders = res[1].map(v => v[5]);

  const tokenPerSecCalls = rewarders.map(rewarder => {
    if (rewarder === '0x0000000000000000000000000000000000000000') return new BigNumber('NaN');
    let rewarderContract = fetchContract(rewarder, SimpleRewarderPerSec, METIS_CHAIN_ID);
    return rewarderContract.read.tokenPerSec();
  });

  const tokenPerSecDataResuls = await Promise.all(tokenPerSecCalls);
  const tokenPerSecData = tokenPerSecDataResuls.map(v => new BigNumber(v.toString()));

  return { balances, allocPoints, tokenPerSecData };
};

module.exports = getNetswapApys;
