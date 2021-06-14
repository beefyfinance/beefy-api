const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const SwampChef = require('../../../../abis/degens/SwampChef.json');
const SwampStrat = require('../../../../abis/StrategyCakeSwamp.json');
const MasterChef = require('../../../../abis/MasterChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/swampyCakeLpPools.json');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const ERC20 = require('../../../../abis/ERC20.json');
const { lpTokenPrice } = require('../../../../utils/lpTokens');

const swampchef = '0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3';
const masterchef = '0x73feaa1ee314f8c655e354234017be2193c9e24e';
const oracleId = 'SWAMP';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getSwampyLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, swampchef, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, swampchef, pool) => {
  const [
    yearlyRewardsInUsd,
    totalStakedInUsd,
    cakeYearlyRewardsInUsd,
    cakeTotalStakedInUsd,
  ] = await Promise.all([
    getYearlyRewardsInUsd(swampchef, pool),
    getTotalLpStakedInUsd(pool),
    getCakeYearlyRewardsInUsd(masterchef, pool),
    getCakeTotalLpStakedInUsd(masterchef, pool),
  ]);
  const simpleApySwamp = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const simpleApyCake = cakeYearlyRewardsInUsd.dividedBy(cakeTotalStakedInUsd);
  const simpleApy = new BigNumber(simpleApyCake.plus(simpleApySwamp));
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApyCake.valueOf(), simpleApySwamp.valueOf(), simpleApy, apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), cakeTotalStakedInUsd.valueOf(), cakeYearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getCakeYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.uPoolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const cakePrice = await fetchPrice({ oracle: 'tokens', id: 'Cake' });
  const cakeYearlyRewardsInUsd = yearlyRewards.times(cakePrice).dividedBy('1e18');

  return cakeYearlyRewardsInUsd;
};

const getYearlyRewardsInUsd = async (swampchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const swampchefContract = new web3.eth.Contract(SwampChef, swampchef);

  const multiplier = new BigNumber(
    await swampchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await swampchefContract.methods.NATIVEPerBlock().call());

  let { allocPoint } = await swampchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await swampchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getCakeTotalLpStakedInUsd = async (masterchef, pool) => {
  const tokenPairContract = new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(masterchef).call());
  const tokenPrice = await lpTokenPrice(pool);
  const cakeTotalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return cakeTotalStakedInUsd;
};

const getTotalLpStakedInUsd = async pool => {
  const strategyContract = new web3.eth.Contract(SwampStrat, pool.strategy);
  const totalStaked = new BigNumber(await strategyContract.methods.wantLockedTotal().call());
  const tokenPrice = await lpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getSwampyLpApys;
