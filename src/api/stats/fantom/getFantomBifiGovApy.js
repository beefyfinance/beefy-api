const BigNumber = require('bignumber.js');
const { fantomWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const BIFI = '0xd6070ae98b8069de6B494332d1A1a81B6179D960';
const REWARDS = '0x7fB900C14c9889A559C777D016a885995cE759Ee';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getFantomBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'fantom-bifi-gov': apr,
    },
    apyBreakdowns: {
      'fantom-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const fantomPrice = await fetchPrice({ oracle: ORACLE, id: 'WFTM' });

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
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

module.exports = getFantomBifiGovApy;
