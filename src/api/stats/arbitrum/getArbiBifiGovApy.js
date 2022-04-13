const BigNumber = require('bignumber.js');
const { arbitrumWeb3: web3, web3Factory, arbitrumWeb3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const BIFI = '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE';
const REWARDS = '0x48F4634c8383aF01BF71AefBC125eb582eb3C74D';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getArbiBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'arbi-bifi-gov': apr,
    },
    apyBreakdowns: {
      'arbi-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const ethPrice = await fetchPrice({ oracle: ORACLE, id: 'ETH' });

  const rewardPool = new getContractWithProvider(IRewardPool, REWARDS, arbitrumWeb3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(ethPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(42161);

  const tokenContract = getContractWithProvider(ERC20, BIFI, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = { getArbiBifiGovApy };
