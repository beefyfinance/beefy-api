const axios = require('axios');
const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/DoppleMasterChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const lpPools = require('../../../../data/doppleLpPools.json');
const pools = require('../../../../data/dopplePools.json');
const { compound } = require('../../../../utils/compound');
const {
  getTotalLpStakedInUsd,
  getTotalStakedInUsd,
} = require('../../../../utils/getTotalStakedInUsd');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const getDoppleApys = async () => {
  let apys = {};
  const masterchef = '0xDa0a175960007b0919DBF11a38e6EC52896bddbE';

  const baseApys = await getBaseApys();

  let promises = [];
  [...lpPools, ...pools].forEach(pool => promises.push(getPoolApy(masterchef, pool, baseApys)));
  const values = await Promise.all(promises);

  for (const item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool, baseApys) => {
  let getTotalStaked;
  if (pool.token) {
    getTotalStaked = getTotalStakedInUsd(masterchef, pool.token, pool.oracle, pool.oracleId);
  } else {
    getTotalStaked = getTotalLpStakedInUsd(masterchef, pool);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStaked,
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const baseApy = getPoolBaseApy(pool, baseApys);
  const simpleApy = rewardsApy.plus(baseApy);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, baseApy, rewardsApy.valueOf(), simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getPoolBaseApy = (pool, baseApys) => {
  if (!baseApys || !pool.swap) return 0;
  try {
    return Number(baseApys[pool.swap].apy) / 100;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const getBaseApys = async () => {
  try {
    const response = await axios.get('https://dopple-api.kowito.com/');
    return response.data.pool;
  } catch (err) {
    console.error(err);
  }
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.dopplePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'DOP' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getDoppleApys;
