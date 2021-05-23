const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const {
  getTotalLpStakedInUsd,
  getTotalStakedInUsd,
} = require('../../../utils/getTotalStakedInUsd');
const { POLYGON_CHAIN_ID } = require('../../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { BASE_HPY } = require('../../../constants');

const getMasterChefApys = async masterchefParams => {
  let apys = {};

  let promises = [];

  const pairAddresses = masterchefParams.pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(
    masterchefParams.tradingFeeInfoClient,
    pairAddresses,
    masterchefParams.liquidityProviderFee
  );

  masterchefParams.pools.forEach(pool => {
    const tradingAprLookup = tradingAprs[pool.address.toLowerCase()];
    const tradingApr = tradingAprLookup ? tradingAprLookup : BigNumber(0);
    promises.push(getPoolApy(masterchefParams, pool, tradingApr));
  });
  if (masterchefParams.singlePools) {
    masterchefParams.singlePools.forEach(pool => promises.push(getPoolApy(masterchefParams, pool)));
  }
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (params, pool, tradingApr = 0) => {
  let getTotalStaked;
  if (pool.token) {
    getTotalStaked = getTotalStakedInUsd(
      params.masterchef,
      pool.token,
      params.oracle,
      params.oracleId,
      params.decimals,
      POLYGON_CHAIN_ID
    );
  } else {
    getTotalStaked = getTotalLpStakedInUsd(params.masterchef, pool, POLYGON_CHAIN_ID);
  }

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params, pool),
    getTotalStaked,
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = getFarmWithTradingFeesApy(simpleApy, tradingApr, BASE_HPY, 1, 0.955);
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
    const blockNum = await getBlockNumber(POLYGON_CHAIN_ID);
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

  const secondsPerBlock = 2;
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
