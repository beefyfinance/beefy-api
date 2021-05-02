const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/PumpyFarm.json');
const Strat = require('../../../abis/AutoStratX.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/pumpyLpPools.json');
const { compound } = require('../../../utils/compound');
const { BSC_CHAIN_ID } = require('../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');

const masterchef = '0x29142471a5c33a2a4cD7C8f18Ce881F699b0c681';
const oracleId = 'PMP';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getPumpyLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
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

const getTotalLpStakedInUsd = async (masterchef, pool) => {
  const masterbeltContract = new web3.eth.Contract(MasterChef, masterchef);
  let { strat } = await masterbeltContract.methods.poolInfo(pool.poolId).call();

  const poolContract = new web3.eth.Contract(Strat, strat);
  const wantLockedTotal = new BigNumber(await poolContract.methods.wantLockedTotal().call());

  const tokenPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return wantLockedTotal.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.PMPPerBlock().call());

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
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getPumpyLpApys;
