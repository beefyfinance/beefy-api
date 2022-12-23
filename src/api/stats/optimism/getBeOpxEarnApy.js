const BigNumber = require('bignumber.js');
const { optimismWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const stakingToken = '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0';
const RewardPool = '0x96f990d1aAF83B09a4BA3D22cAab0377a058C84f';
const ORACLE = 'tokens';
const ORACLE_ID = 'beOPX';
const DECIMALS = '1e18';

const getBeOpxEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-beopx-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-beopx-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const rewardPrice = await fetchPrice({ oracle: ORACLE, id: 'WETH' });

  const rewardPool = getContractWithProvider(IRewardPool, RewardPool, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(rewardPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(10);

  const tokenContract = getContractWithProvider(ERC20, stakingToken, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(RewardPool).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getBeOpxEarnApy;
