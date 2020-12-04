const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const IBakeryMaster = require('../../../abis/IBakeryMaster.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/bakeryLpPools.json');
const { compound } = require('../../../utils/compound');
const getLpTokenPrice = require('../../../utils/getLpTokenPrice');

const web3 = new Web3(process.env.BSC_RPC_2 || process.env.BSC_RPC);

const getBakeryLpApys = async () => {
  let apys = {};
  const bakeryMaster = '0x20eC291bB8459b6145317E7126532CE7EcE5056f';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(bakeryMaster, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (bakeryMaster, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(bakeryMaster, pool),
    getTotalStakedInUsd(bakeryMaster, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  console.log(pool.name, simpleApy.toString());
  const apy = compound(simpleApy, process.env.CAKE_LP_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (bakeryMaster, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const bakeryMasterContract = new web3.eth.Contract(IBakeryMaster, bakeryMaster);

  const blockRewards = new BigNumber(
    await bakeryMasterContract.methods.getTotalRewardInfo(blockNum, blockNum + 1).call()
  );

  let { allocPoint } = await bakeryMasterContract.methods.poolInfoMap(pool.address).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(
    await bakeryMasterContract.methods.totalAllocPoint().call()
  );
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bakePrice = await getPrice('pancake', 'BAKE');
  const yearlyRewardsInUsd = yearlyRewards.times(bakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (bakeryMaster, pool) => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(bakeryMaster).call());
  const tokenPrice = await getLpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

getBakeryLpApys();

module.exports = getBakeryLpApys;
