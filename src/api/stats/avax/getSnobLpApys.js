const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/IceQueen.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/avax/snobLpPools.json');
const { compound } = require('../../../utils/compound');
const {
  getTotalStakedInUsd,
  getTotalLpStakedInUsd,
} = require('../../../utils/getTotalStakedInUsd');
const { AVAX_CHAIN_ID } = require('../../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');

const masterchef = '0xB12531a2d758c7a8BF09f44FC88E646E1BF9D375';
const oracleId = 'SNOB';
const oracle = 'tokens';
const DECIMALS = '1e18';
const chainId = 43114;

const getSnobLpApys = async () => {
  let apys = {};

  const allPools = pools.slice();
  allPools.push({
    name: 'snob-3pool',
    poolId: 7,
    address: '0xde1a11c331a0e45b9ba8fee04d4b51a745f1e4a4',
    oracle: 'lps',
    oracleId: 'snob-3pool',
  });

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  let getTotalStaked;
  if (pool.poolId === 7) {
    getTotalStaked = getTotalStakedInUsd(
      masterchef,
      pool.address,
      pool.oracle,
      pool.oracleId,
      '1e18',
      43114
    );
  } else {
    getTotalStaked = getTotalLpStakedInUsd(masterchef, pool, chainId);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStaked,
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(AVAX_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.snowballPerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 5;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getSnobLpApys;
