const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { bscWeb3: web3, multicallAddress } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/degens/ApeJungleChef.json');
const ERC20 = require('../../../../abis/ERC20.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/apeJungleLpPools.json');
const { BASE_HPY, BSC_CHAIN_ID, APE_LPF } = require('../../../../constants');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../../utils/getFarmWithTradingFeesApy';
import { getContract } from '../../../../utils/contractHelper';

const { apeClient } = require('../../../../apollo/client');
const { compound } = require('../../../../utils/compound');

const secondsPerBlock = 3;
const secondsPerYear = 31536000;

const getApeJungleApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const { balances, rewards } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(apeClient, pairAddresses, APE_LPF);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const tokenPrice = await fetchPrice({ oracle: pool.reward.oracle, id: pool.reward.oracleId });

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const yearlyRewards = rewards[i].dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.reward.decimals);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const shareAfterBeefyPerformanceFee = 1 - (pool.beefyFee ? pool.beefyFee : 0.045);
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
        beefyPerformanceFee: pool.beefyFee ? pool.beefyFee : 0.045,
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
  const multicall = new MultiCall(web3, multicallAddress(BSC_CHAIN_ID));
  const balanceCalls = [];
  const rewardPerBlockCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    const masterchefContract = getContract(MasterChef, pool.rewardPool);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.rewardPool),
    });
    rewardPerBlockCalls.push({
      rewardPerBlock: masterchefContract.methods.rewardPerBlock(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardPerBlockCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewards = res[1].map(v => new BigNumber(v.rewardPerBlock));
  return { balances, rewards };
};

module.exports = getApeJungleApys;
