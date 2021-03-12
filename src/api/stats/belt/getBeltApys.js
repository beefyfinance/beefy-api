const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const MasterBelt = require('../../../abis/MasterBelt.json');
const VaultPool = require('../../../abis/BeltVaultPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/beltPools.json');
const { compound } = require('../../../utils/compound');
const getBeltVenusLpPrice = require('./getBeltVenusLpPrice');

const masterbelt = '0xD4BbC80b9B102b77B21A06cb77E954049605E6c1';
const oracleId = 'BELT';
const oracle = 'pancake';
const DECIMALS = '1e18';

const getBeltApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterbelt, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getTotalLpStakedInUsd = async (masterbelt, pool) => {
  const masterbeltContract = new web3.eth.Contract(MasterBelt, masterbelt);
  let { strat } = await masterbeltContract.methods.poolInfo(pool.poolId).call();

  const poolContract = new web3.eth.Contract(VaultPool, strat);
  const wantLockedTotal = new BigNumber(await poolContract.methods.wantLockedTotal().call());

  let tokenPrice;
  if (pool.poolId === 0) {
    tokenPrice = (await getBeltVenusLpPrice())[pool.name];
  } else {
    tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  }
  return wantLockedTotal.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async (masterbelt, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const masterbeltContract = new web3.eth.Contract(MasterBelt, masterbelt);

  const multiplier = new BigNumber(
    await masterbeltContract.methods.getMultiplier(blockNum - 1, blockNum).call(),
  );
  const blockRewards = new BigNumber(await masterbeltContract.methods.BELTPerBlock().call());

  let { allocPoint } = await masterbeltContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterbeltContract.methods.totalAllocPoint().call());
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

module.exports = getBeltApys;
