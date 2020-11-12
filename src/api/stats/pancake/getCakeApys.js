const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const SmartChef = require('../../../abis/SmartChef.json');
const { getPrice } = require('../../../utils/getPrice');
const getTotalStakedInUsd = require('../../../utils/getTotalStakedInUsd');
const pools = require('../../../data/cakePools.json');
const { compound } = require('../../../utils/compound');

const web3 = new Web3(process.env.BSC_RPC);

const getCakeApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool.smartChef, pool.oracle, pool.oracleId, pool.decimals),
    getTotalStakedInUsd(
      pool.smartChef,
      '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      'coingecko',
      'pancakeswap-token'
    ),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.CAKE_HPY, 1, 0.94);

  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (smartChefAddr, oracle, oracleId, decimals) => {
  const smartChefContract = new web3.eth.Contract(SmartChef, smartChefAddr);

  const currentBlock = await web3.eth.getBlockNumber();
  const bonusEndBlock = await smartChefContract.methods.bonusEndBlock().call();
  const isPoolRunning = currentBlock <= bonusEndBlock;

  if (!isPoolRunning) return new BigNumber(0);

  const blockRewards = new BigNumber(await smartChefContract.methods.rewardPerBlock().call());
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
  const earnedAssetPrice = await getPrice(oracle, oracleId);
  const yearlyRewardsInUsd = yearlyRewards.times(earnedAssetPrice).dividedBy(decimals);
  return yearlyRewardsInUsd;
};

module.exports = getCakeApys;
