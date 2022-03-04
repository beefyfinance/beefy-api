const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const StableJoeStaking = require('../../../abis/avax/StableJoeStaking.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/avax/joePool.json');
const { DAILY_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');

const oracle = 'tokens';
const JOE = 'JOE';
const joeDecimals = '1e18';
const ACC_REWARD_PER_SHARE_PRECISION = 1000000000000000000000000;

const liquidityProviderFee = 0.0005;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getJoeApy = async () => {
  const joePrice = await fetchPrice({ oracle, id: JOE });
  const usdcPrice = await fetchPrice({ oracle, id: pool.oracleId });

  const rewardPool = new web3.eth.Contract(StableJoeStaking, pool.rewardPool);
  const accumulatedRewards = new BigNumber(
    await rewardPool.methods.accRewardPerShare(pool.rewardToken).call()
  );

  const totalStaked = new BigNumber(await rewardPool.methods.internalJoeBalance().call());
  const totalStakedInUsd = totalStaked.times(joePrice).dividedBy(joeDecimals);

  const scaledAccumulatedRewards = accumulatedRewards
    .dividedBy(ACC_REWARD_PER_SHARE_PRECISION)
    .times(totalStaked);

  const farmBeginDate = new Date('2/24/2022');
  const today = new Date();
  const diffTime = Math.abs(today - farmBeginDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const yearlyRewards = scaledAccumulatedRewards.dividedBy(diffDays).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(usdcPrice).dividedBy(pool.decimals);
  const yearlyNumber = yearlyRewardsInUsd.toNumber();

  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
  const vaultApy = compound(simpleApr, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);
  const apys = { [pool.name]: vaultApy };

  const apyBreakdowns = {
    [pool.name]: {
      vaultApr: vaultApr.toNumber(),
      compoundingsPerYear: DAILY_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      vaultApy: vaultApy,
      lpFee: liquidityProviderFee,
      tradingApr: 0,
      totalApy: vaultApy,
    },
  };

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = getJoeApy;
