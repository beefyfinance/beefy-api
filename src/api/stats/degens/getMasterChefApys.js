const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');

const getMasterChefApys = async (masterchef, masterChefAbi, tokenPerBlock, pools, oracle, oracleId, decimals) => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, masterChefAbi, tokenPerBlock, pool, oracle, oracleId, decimals)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, masterChefAbi, tokenPerBlock, pool, oracle, oracleId, decimals) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, masterChefAbi, pool, tokenPerBlock, oracle, oracleId, decimals),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, masterChefAbi, pool, tokenPerBlock, oracle, oracleId, decimals) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(masterChefAbi, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call(),
  );
  const blockRewards = new BigNumber(await masterchefContract.methods[tokenPerBlock]().call());

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

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(decimals);

  return yearlyRewardsInUsd;
};

module.exports = getMasterChefApys;
