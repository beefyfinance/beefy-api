const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const getMasterChefApys = async masterchefParams => {
  let apys = {};

  let promises = [];
  masterchefParams.pools.forEach(pool => promises.push(getPoolApy(masterchefParams, pool)));
  if (masterchefParams.singlePools) {
    masterchefParams.singlePools.forEach(pool => promises.push(getPoolApy(masterchefParams, pool)));
  }
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (params, pool) => {
  let getTotalStaked;
  if (pool.token) {
    const oracleId = pool.oracleId ? pool.oracleId : params.oracleId;
    const decimals = pool.decimals ? pool.decimals : params.decimals;
    getTotalStaked = getTotalStakedInUsd(
      params.masterchef,
      pool.token,
      params.oracle,
      oracleId,
      decimals
    );
  } else {
    getTotalStaked = getTotalStakedInUsd(params.masterchef, pool.address, 'lps', pool.name);
  }

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool),
    getTotalStaked,
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  if (params.log) {
    console.log(
      pool.name,
      simpleApy.valueOf(),
      apy,
      totalStakedInUsd.valueOf(),
      yearlyRewardsInUsd.valueOf()
    );
  }
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (params, pool) => {
  const masterchefContract = new web3.eth.Contract(params.masterchefAbi, params.masterchef);

  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(BSC_CHAIN_ID);
    multiplier = new BigNumber(
      await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
    );
  }
  const blockRewards = new BigNumber(
    await masterchefContract.methods[params.tokenPerBlock]().call()
  );

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

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

  if (params.burn) {
    yearlyRewardsInUsd = yearlyRewardsInUsd.times(1 - params.burn);
  }

  return yearlyRewardsInUsd;
};

module.exports = getMasterChefApys;
