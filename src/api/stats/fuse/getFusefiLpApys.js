const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/fuse/fusefiLpPools.json');
const { BASE_HPY, FUSE_CHAIN_ID, FUSEFI_LPF } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { fusefiClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import MultiReward from '../../../abis/fuse/MultiReward';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const {
  fuse: {
    tokens: { WFUSE },
  },
} = addressBook;

const oracle = 'tokens';
const oracleId = 'WFUSE';
const DECIMALS = '1e18';

const getFusefiLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pairAddresses = pools.map(pool => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeApr(fusefiClient, pairAddresses, FUSEFI_LPF),
    getFarmApys(pools),
  ]);

  pools.forEach((pool, i) => {
    const simpleApy = farmApys[i];
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
    // Add token to APYs object
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: FUSEFI_LPF,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
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
  const { balances, rewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const yearlyRewards = SECONDS_PER_YEAR.times(rewardRates[i]);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }
  return apys;
};

const getPoolsData = async pools => {
  const balanceCalls = pools.map(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, FUSE_CHAIN_ID);
    return tokenContract.read.balanceOf([pool.rewardPool]);
  });
  const rewardRateCalls = pools.map(pool => {
    const rewardPool = fetchContract(pool.rewardPool, MultiReward, FUSE_CHAIN_ID);
    return rewardPool.read.rewardData([WFUSE.address]);
  });

  const [balanceResults, rewardRateResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
  ]);

  const balances = balanceResults.map(v => new BigNumber(v.toString()));
  const rewardRates = rewardRateResults.map(v => new BigNumber(v['3'].toString()));
  return { balances, rewardRates };
};

module.exports = getFusefiLpApys;
