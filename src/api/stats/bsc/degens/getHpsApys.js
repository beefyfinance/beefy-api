const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const { compound } = require('../../../../utils/compound');
const fetchPrice = require('../../../../utils/fetchPrice');

const oracle = 'tokens';
const oracleId = 'HPS';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const pools = [
  {
    name: 'hps-hps-bnb',
    pool: '0xcC16f9Ca629b140d46886A82FeaF586A5532BD99',
    oracle: 'lps',
    oracleId: 'hps-hps-bnb',
  },
  {
    name: 'hps-hps',
    pool: '0xDC284d444A5Ec2B594267F29FFB8eB7Fde76B8fD',
    oracle: 'tokens',
    oracleId: 'HPS',
  },
];

const getHpsApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getTotalStakedInUsd = async pool => {
  const tokenContract = new web3.eth.Contract(IRewardPool, pool.pool);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async pool => {
  const bhcPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pool.pool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(bhcPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getHpsApys;
