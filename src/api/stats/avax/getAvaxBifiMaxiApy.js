const BigNumber = require('bignumber.js');
const { avaxWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { DAILY_HPY } = require('../../../constants');
const ERC20 = require('../../../abis/ERC20.json');

const BIFI = '0xd6070ae98b8069de6B494332d1A1a81B6179D960';
const REWARDS = '0x86d38c6b6313c5A3021D68D1F57CF5e69197592A';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAvaxBifiMaxiApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, DAILY_HPY, 1, 0.9995);

  return { 'avax-bifi-maxi': apy };
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

  const tokenContract = new web3.eth.Contract(ERC20, BIFI);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getAvaxBifiMaxiApy;
