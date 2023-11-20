const BigNumber = require('bignumber.js');
const MasterChef = require('../../../../abis/degens/ApeJungleChef.json');
import { fetchPrice } from '../../../../utils/fetchPrice';
const pools = require('../../../../data/degens/apeJungleLpPools.json');
const { BASE_HPY, BSC_CHAIN_ID, APE_LPF } = require('../../../../constants');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../../utils/getFarmWithTradingFeesApy';
import { getTotalPerformanceFeeForVault } from '../../../vaults/getVaultFees';
import { fetchContract } from '../../../rpc/client';
import ERC20Abi from '../../../../abis/ERC20Abi';

const { apeClient } = require('../../../../apollo/client');
const { compound } = require('../../../../utils/compound');

const secondsPerBlock = 3;
const secondsPerYear = 31536000;

const getApeJungleApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pairAddresses = pools.map(pool => pool.address);

  const [{ balances, rewards }, tradingAprs] = await Promise.all([
    getPoolsData(pools),
    getTradingFeeApr(apeClient, pairAddresses, APE_LPF),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const tokenPrice = await fetchPrice({ oracle: pool.reward.oracle, id: pool.reward.oracleId });

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const yearlyRewards = rewards[i].dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.reward.decimals);

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
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: APE_LPF,
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

const getPoolsData = async pools => {
  const balanceCalls = [];
  const rewardPerBlockCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, BSC_CHAIN_ID);
    const masterchefContract = fetchContract(pool.rewardPool, MasterChef, BSC_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([pool.rewardPool]));
    rewardPerBlockCalls.push(masterchefContract.read.rewardPerBlock());
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(rewardPerBlockCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewards = res[1].map(v => new BigNumber(v.toString()));
  return { balances, rewards };
};

module.exports = getApeJungleApys;
