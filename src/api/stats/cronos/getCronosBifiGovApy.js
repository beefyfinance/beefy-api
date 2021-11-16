const BigNumber = require('bignumber.js');
const { cronosWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const getBlockTime = require('../../../utils/getBlockTime');

const BIFI = '0xe6801928061CDbE32AC5AD0634427E140EFd05F9';
const REWARDS = '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';

const getCronosBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'cronos-bifi-gov': apr,
    },
    apyBreakdowns: {
      'cronos-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const celoPrice = await fetchPrice({ oracle: ORACLE, id: 'WCRO' });

  const secondsPerYear = 31536000;
  const secondsPerBlock = await getBlockTime(25);
  const blocksPerDay = new BigNumber(secondsPerYear.dividedBy(secondsPerBlock));

  const rewardPool = new web3.eth.Contract(IRewardPool, REWARDS);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(blocksPerDay).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(celoPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(25);

  const tokenContract = new web3.eth.Contract(ERC20, BIFI);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = { getCronosBifiGovApy };
