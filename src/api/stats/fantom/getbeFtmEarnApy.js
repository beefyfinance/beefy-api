const BigNumber = require('bignumber.js');
const { fantomWeb3: web3, web3Factory } = require('../../../utils/web3');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const { default: IRewardPool } = require('../../../abis/IRewardPool');

const BIFI = '0x7381eD41F6dE418DdE5e84B55590422a57917886';
const REWARDS = '0xE00D25938671525C2542A689e42D1cfA56De5888';
const ORACLE = 'tokens';
const ORACLE_ID = 'beFTM';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getbeFtmEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-beFTM-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-beFTM-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const fantomPrice = await fetchPrice({ oracle: ORACLE, id: 'WFTM' });

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(fantomPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(250);

  const tokenContract = getContractWithProvider(ERC20, BIFI, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeFtmEarnApy;
