const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const BIFI = '0xCa3F508B8e4Dd382eE878A314789373D80A5190A';
const REWARDS = '0x0d5761D9181C7745855FC985f646a842EB254eB9';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(REWARDS, BIFI, ORACLE, ORACLE_ID, DECIMALS),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'bifi-gov': apr,
    },
    apyBreakdowns: {
      'bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const bnbPrice = await fetchPrice({ oracle: 'tokens', id: 'WBNB' });

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(bnbPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBifiGovApy;
