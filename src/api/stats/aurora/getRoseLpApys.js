const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { auroraWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/fuse/MultiReward.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/aurora/rosePools.json');
const { BASE_HPY, AURORA_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
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
  const { balances, rewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    let yearlyRewards = SECONDS_PER_YEAR.times(rewardRates[i]);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
    if (pool.oracleIdB != undefined) {
      const rewardPool = getContractWithProvider(IRewardPool, pool.rewardPool, web3);
      const secondData = await rewardPool.methods.rewardData(pool.rewardToken).call();
      const yearlyRewardsB = SECONDS_PER_YEAR.times(new BigNumber(secondData.rewardRate));
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
  const multicall = new MultiCall(web3, multicallAddress(AURORA_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.rewardPool),
    });
    const rewardPool = getContract(IRewardPool, pool.rewardPool);
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardData(ROSE.address),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate['3']));
  return { balances, rewardRates };
};

module.exports = getRoseLpApys;
