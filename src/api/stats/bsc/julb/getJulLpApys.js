const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/julLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const oracle = 'tokens';
const oracleId = 'JULD';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const bifiBnbRewardPool = '0x24AdC534eb39d3B672018E6575C0C4B700Cf9322'; // BIFI-BNB
const juldBnbRewardPool = '0x966D7053337Bfe74b23c2e8C053F96134070d301'; // JULD-BNB

const getJulLpApys = async () => {
  let poolBifiBnb = pools.filter(pool => pool.name === 'jul-bifi-bnb')[0];
  let poolJuldBnb = pools.filter(pool => pool.name === 'jul-juld-bnb')[0];

  const values = await Promise.all([
    getPoolApy(bifiBnbRewardPool, poolBifiBnb),
    getPoolApy(juldBnbRewardPool, poolJuldBnb),
  ]);

  let apys = {};
  for (let item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getTotalLpStakedInUsd(rewardPool, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async julRewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, julRewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getJulLpApys;
