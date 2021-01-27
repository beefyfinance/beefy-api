const BigNumber = require('bignumber.js');
const web3 = require('../../../utils/web3');

const MasterFuel = require('../../../abis/MasterFuel.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/jetfuelLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const getJetfuelLpApys = async () => {
  let apys = {};
  const masterFuel = '0x86f4bC1EBf2C209D12d3587B7085aEA5707d4B56';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterFuel, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterFuel, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterFuel, pool.poolId),
    getTotalLpStakedInUsd(masterFuel, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.94);

  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterFuel, poolId) => {
  const currentBlock = await web3.eth.getBlockNumber();
  const masterFuelContract = new web3.eth.Contract(MasterFuel, masterFuel);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    masterFuelContract.methods.getTotalRewardInfo(currentBlock, currentBlock + 1).call(),
    masterFuelContract.methods.totalAllocPoint().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  let { allocPoint } = await masterFuelContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const fuelPrice = await getPrice('pancake', 'Fuel');
  const yearlyRewardsInUsd = yearlyRewards.times(fuelPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getJetfuelLpApys;
