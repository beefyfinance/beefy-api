const BigNumber = require('bignumber.js');
const web3 = require('../../../utils/web3');

const OriginalGangster = require('../../../abis/OriginalGangster.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/thugsLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const getThugsLpApys = async () => {
  let apys = {};
  const gangster = '0x03edb31BeCc296d45670790c947150DAfEC2E238';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(gangster, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (gangster, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(gangster, pool),
    getTotalLpStakedInUsd(gangster, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.94);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (gangster, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const gangsterContract = new web3.eth.Contract(OriginalGangster, gangster);

  const multiplier = new BigNumber(
    await gangsterContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await gangsterContract.methods.drugsPerBlock().call());

  let { allocPoint } = await gangsterContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await gangsterContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const drugsPrice = await getPrice(
    'thugs',
    '0x339550404Ca4d831D12B1b2e4768869997390010_0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  );
  const yearlyRewardsInUsd = yearlyRewards.times(drugsPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getThugsLpApys;
