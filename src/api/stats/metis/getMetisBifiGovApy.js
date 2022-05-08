const BigNumber = require('bignumber.js');
const { metisWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const BIFI = '0xe6801928061CDbE32AC5AD0634427E140EFd05F9';
const REWARDS = '0x2a30C5e0d577108F694d2A96179cd73611Ee069b';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMetisBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'metis-bifi-gov': apr,
    },
    apyBreakdowns: {
      'metis-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const metisPrice = await fetchPrice({ oracle: ORACLE, id: 'METIS' });

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(metisPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(1088);

  const tokenContract = getContractWithProvider(ERC20, BIFI, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getMetisBifiGovApy;
