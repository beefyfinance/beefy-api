const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const fetchPrice = require('../../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const RewardPool = require('../../../../abis/BombReward.json');
const rewardPool = '0x1083926054069AaD75d7238E9B809b0eF9d94e5B';

const BIFI = '0x522348779DCb2911539e76A1042aA922F9C47Ee3';
const bomb = '0x522348779DCb2911539e76A1042aA922F9C47Ee3';
const bshare = '0x531780FAcE85306877D7e1F05d713D1B50a37F7A';
const ORACLE = 'tokens';
const ORACLE_ID = 'BSHARE';
const ORACLE_ID2 = 'BOMB';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBsharePoolApys = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool, 5),
    getTotalStakedInUsd(rewardPool, bomb, ORACLE, ORACLE_ID2, DECIMALS),
  ]);
  console.log('totalStakedInUsd pool: ', ORACLE_ID2, Number(totalStakedInUsd));
  console.log('yearlyRewardsInUsd pool: ', ORACLE_ID2, Number(yearlyRewardsInUsd));

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'bomb-bomb': apr,
    },
    apyBreakdowns: {
      'bomb-bomb': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async (rewardPool, poolId) => {
  const rewardPoolContract = new web3.eth.Contract(RewardPool, rewardPool);

  let { allocPoint } = await rewardPoolContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const fromTime = Math.floor(Date.now() / 1000);
  let [secondRewards, totalAllocPoint] = await Promise.all([
    rewardPoolContract.methods.getGeneratedReward(fromTime, fromTime + 1).call(),
    rewardPoolContract.methods.totalAllocPoint().call(),
  ]);

  secondRewards = new BigNumber(secondRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  const secondsPerYear = 31536000;
  const yearlyRewards = secondRewards
    .times(secondsPerYear)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);
  const price = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);
  return yearlyRewardsInUsd;
};

module.exports = getBsharePoolApys;
