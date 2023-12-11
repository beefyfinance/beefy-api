const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const lpPools = require('../../../data/aurora/trisolarisMiniLpPools.json');
const stablePools = require('../../../data/aurora/trisolarisStableLpPools.json');
const { BASE_HPY, AURORA_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import TriChef from '../../../abis/aurora/TriChef';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import TriRewarder from '../../../abis/aurora/TriRewarder';
const {
  aurora: {
    platforms: {
      trisolaris: { minichef },
    },
    tokens: { TRI },
  },
} = addressBook;

const masterchef = minichef;
const pools = [...lpPools, ...stablePools];

const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const getTriMinichefApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: TRI.oracleId });

  const [{ rewardPerSecond, totalAllocPoint }, { balances, allocPoints, rewarders }] =
    await Promise.all([getMasterChefData(), getPoolsData(pools)]);

  const rewarderTokensPerBlock = await Promise.all(
    rewarders.map(rewarder => {
      if (rewarder === '0x0000000000000000000000000000000000000000') {
        return new Promise(resolve => resolve(0));
      }
      const rewarderContract = fetchContract(rewarder, TriRewarder, AURORA_CHAIN_ID);
      return rewarderContract.read.tokenPerBlock();
    })
  );

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);

    const yearlyRewardsBInUsd = await (async () => {
      if (rewarders[i] === '0x0000000000000000000000000000000000000000') {
        return 0;
      } else {
        const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
        const tokenBPerSec = new BigNumber(rewarderTokensPerBlock[i].toString());
        const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
        return yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
      }
    })();

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    // console.log(pool.name, simpleApy.valueOf(), tradingApr.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

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
  const masterchefContract = fetchContract(masterchef, TriChef, AURORA_CHAIN_ID);
  const res = await Promise.all([
    masterchefContract.read.triPerBlock(),
    masterchefContract.read.totalAllocPoint(),
  ]);
  const rewardPerSecond = new BigNumber(res[0].toString());
  const totalAllocPoint = new BigNumber(res[1].toString());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, TriChef, AURORA_CHAIN_ID);

  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];

  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, AURORA_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    rewarderCalls.push(masterchefContract.read.rewarder([pool.poolId]));
  });

  const [balanceResults, poolInfoResults, rewarderResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(poolInfoCalls),
    Promise.all(rewarderCalls),
  ]);

  const balances = balanceResults.map(v => new BigNumber(v.toString()));
  const allocPoints = poolInfoResults.map(v => new BigNumber(v['2'].toString()));
  const rewarders = rewarderResults.map(v => v.toString());
  return { balances, allocPoints, rewarders };
};

module.exports = getTriMinichefApys;
