const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/MasterChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/kebabLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const getKebabLpApys = async () => {
  let apys = {};
  const masterchef = '0x76fcefffcf5325c6156ca89639b17464ea833ecd';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStakedInUsd(masterchef, pool.address, 'lps', pool.name),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());

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

  const kebabPrice = await fetchPrice({ oracle: 'tokens', id: 'KEBAB' });
  const yearlyRewardsInUsd = yearlyRewards.times(kebabPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getKebabLpApys;
