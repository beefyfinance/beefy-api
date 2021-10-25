const BigNumber = require('bignumber.js');
const { avaxWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { DAILY_HPY } = require('../../../constants');
const ERC20 = require('../../../abis/ERC20.json');

const PNG = '0x60781C2586D68229fde47564546784ab3fACA982';
const REWARDS = '0xD49B406A7A29D64e081164F6C3353C599A2EeAE9';
const ORACLE = 'tokens';
const ORACLE_ID = 'PNG';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getPangolinPNGApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, DAILY_HPY, 1, 0.955);

  return { 'pangolin-png': apy };
};

const getYearlyRewardsInUsd = async () => {
  const avaxPrice = await fetchPrice({ oracle: ORACLE, id: 'AVAX' });

  const rewardPool = new web3.eth.Contract(IRewardPool, REWARDS);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(avaxPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(43114);

  const tokenContract = new web3.eth.Contract(ERC20, PNG);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getPangolinPNGApy;
