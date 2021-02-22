const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const SmartChef = require('../../../abis/SmartChef.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const pools = require('../../../data/cakePools.json');
const { compound } = require('../../../utils/compound');
const getCakeSmartApy = require('./getCakeSmartApy');
const { HOURLY_HPY } = require('../../../../constants');

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
  const apy = compound(simpleApy, HOURLY_HPY, 1, 0.94);

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
  const earnedAssetPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(earnedAssetPrice).dividedBy(decimals);
  return yearlyRewardsInUsd;
};

module.exports = getCakeApys;
