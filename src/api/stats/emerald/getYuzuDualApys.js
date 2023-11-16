const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/emerald/yuzuDualLpPools.json');
const { BASE_HPY, EMERALD_CHAIN_ID: chainId, EMERALD_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { fetchContract } from '../../rpc/client';
import Rewarder from '../../../abis/emerald/Rewarder';
import YuzuMasterchefExt from '../../../abis/emerald/YuzuMasterchefExt';
import ERC20Abi from '../../../abis/ERC20Abi';
import YuzuChef from '../../../abis/emerald/YuzuChef';
const getBlockTime = require('../../../utils/getBlockTime');
const {
  emerald: {
    platforms: {
      yuzu: { masterchef, masterchefExt },
    },
    tokens: { YUZU },
  },
} = addressBook;

const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerYear = 31536000;

const getYuzuDualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: 'YUZU' });

  const [
    { rewardPerSecond, totalAllocPoint, totalAllocPointMC, masterChefExtAlloc },
    { balances, allocPoints, rewarders },
    secondsPerBlock,
  ] = await Promise.all([getMasterChefData(), getPoolsData(pools), getBlockTime(chainId)]);

  //These request need the response from getPoolsData, so they need to be done after
  const rewarderRates = await Promise.all(
    rewarders.map(rewarder => {
      if (!rewarder) return new BigNumber(0);
      return fetchContract(rewarder, Rewarder, EMERALD_CHAIN_ID).read.tokenPerBlock();
    })
  );

  const rewardPerBlock = rewardPerSecond
    .times(new BigNumber(masterChefExtAlloc[1].toString()))
    .dividedBy(totalAllocPointMC);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerBlock
      .times(new BigNumber(allocPoints[i].toString()))
      .dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);

    const yearlyRewardsBInUsd = await (async () => {
      if (!rewarders[i]) {
        return 0;
      } else {
        // console.log(pool.name, rewarders[i].toString());
        const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
        const tokenBPerSec = new BigNumber(rewarderRates[i].toString());
        const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
        return yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
      }
    })();

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    // console.log(pool.name, simpleApy.valueOf(), vaultApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: vaultApy };

    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: 0,
        tradingApr: 0,
        totalApy: vaultApy,
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
  const masterchefContract = fetchContract(masterchef, YuzuChef, EMERALD_CHAIN_ID);
  const masterchefContractExt = fetchContract(masterchefExt, YuzuMasterchefExt, EMERALD_CHAIN_ID);

  const [rewardPerSecond, totalAllocPointMC, totalAllocPoint, masterChefExtAlloc] =
    await Promise.all([
      masterchefContract.read.yuzuPerBlock().then(v => new BigNumber(v.toString())),
      masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
      masterchefContractExt.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
      masterchefContract.read.poolInfo([5]),
    ]);
  return { rewardPerSecond, totalAllocPoint, totalAllocPointMC, masterChefExtAlloc };
};

const getPoolsData = async pools => {
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];

  const masterchefContract = fetchContract(masterchefExt, YuzuMasterchefExt, EMERALD_CHAIN_ID);
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, EMERALD_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchefExt]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    rewarderCalls.push(masterchefContract.read.poolRewarders([pool.poolId]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(poolInfoCalls),
    Promise.all(rewarderCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => v['1']);
  const rewarders = res[2].map(v => v['0']);
  return { balances, allocPoints, rewarders };
};

module.exports = getYuzuDualApys;
