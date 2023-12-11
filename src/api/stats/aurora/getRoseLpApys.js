const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/aurora/rosePools.json');
const { BASE_HPY, AURORA_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { addressBook } from '../../../../packages/address-book/address-book';
import ERC20Abi from '../../../abis/ERC20Abi';
import MultiReward from '../../../abis/fuse/MultiReward';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';

const {
  aurora: {
    tokens: { ROSE },
  },
} = addressBook;

const oracle = 'tokens';
const oracleId = 'ROSE';
const DECIMALS = '1e18';

const getRoseLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const farmApys = await getFarmApys(pools);

  pools.forEach((pool, i) => {
    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const simpleApy = farmApys[i];
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
    const legacyApyValue = { [pool.name]: vaultApy };
    // Add token to APYs object
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
    // Add token to APYs object
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  });

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getFarmApys = async pools => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const SECONDS_PER_YEAR = new BigNumber(31536000);
  const { balances, rewardRates, extraRewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    let yearlyRewards = SECONDS_PER_YEAR.times(rewardRates[i]);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
    if (pool.oracleIdB != undefined) {
      const yearlyRewardsB = SECONDS_PER_YEAR.times(extraRewardRates[i]);
      const rewardTokenPrice = await fetchPrice({ oracle, id: pool.oracleIdB });
      const yearlyRewardsInUsdB = yearlyRewardsB
        .times(rewardTokenPrice)
        .dividedBy(pool.oracleBDecimals);
      apys.push(yearlyRewardsInUsd.plus(yearlyRewardsInUsdB).dividedBy(totalStakedInUsd));
    } else {
      apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
    }
  }
  return apys;
};

const getPoolsData = async pools => {
  const balanceCalls = pools.map(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, AURORA_CHAIN_ID);
    return tokenContract.read.balanceOf([pool.rewardPool]);
  });
  const rewardRateCalls = pools.map(pool => {
    const rewardPool = fetchContract(pool.rewardPool, MultiReward, AURORA_CHAIN_ID);
    return rewardPool.read.rewardData([ROSE.address]);
  });
  const extraRewardCalls = pools.map(pool => {
    if (pool.oracleIdB != undefined) {
      const rewardPool = fetchContract(pool.rewardPool, MultiReward, AURORA_CHAIN_ID);
      return rewardPool.read.rewardData([pool.rewardToken]);
    } else {
      return new Promise(resolve => resolve(BigInt(0)));
    }
  });

  const [balanceResults, rewardRateResults, extraRewardResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(extraRewardCalls),
  ]);

  const balances = balanceResults.map(v => new BigNumber(v.toString()));
  const rewardRates = rewardRateResults.map(v => new BigNumber(v['3'].toString()));
  const extraRewardRates = extraRewardResults.map(
    v => new BigNumber((v.length ? v['3'] : 0).toString())
  );
  return { balances, rewardRates, extraRewardRates };
};

module.exports = getRoseLpApys;
