const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const DeepFryer = require('../../../abis/DeepFryer.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getPrice } = require('../../../utils/getPrice');
const getTotalStakedInUsd = require('../../../utils/getTotalStakedInUsd');
const pools = require('../../../data/fryPools.json');
const { compound } = require('../../../utils/compound');

const FRYER = '0x066d5544a0b05b19f08e45dbc13758a3590386c4';

const web3 = new Web3(process.env.BSC_RPC);

const getFryApys = async () => {
  const apys = {};

  for (const pool of pools) {
    const [yearlyRewardsInUsd, poolRewardsPercentage, totalStakedInUsd] = await Promise.all([
      getYearlyRewardsInUsd(FRYER, 1),
      getPoolRewardsPercentage(pool.poolIndex, FRYER),
      getTotalStakedInUsd(FRYER, pool.asset, pool.oracle, pool.oracleId, pool.decimals),
    ]);

    const yearlyPoolRewardsInUsd = yearlyRewardsInUsd.times(poolRewardsPercentage);

    const simpleApy = yearlyPoolRewardsInUsd.dividedBy(totalStakedInUsd);
    apys[pool.name] = compound(simpleApy, process.env.FRY_HPY, 1, 0.95);
  }

  return apys;
};

const getYearlyRewardsInUsd = async (fryerAddr, blocks) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + blocks;
  const fryerContract = new web3.eth.Contract(DeepFryer, fryerAddr);

  const periodRewards = new BigNumber(
    await fryerContract.methods.getTotalRewardInfo(fromBlock, toBlock).call()
  );
  const blockRewards = periodRewards.dividedBy(blocks);
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const friesPrice = await getPrice('coingecko', 'fryworld');
  const yearlyRewardsInUsd = yearlyRewards.times(friesPrice).dividedBy('1e18');
  return yearlyRewardsInUsd;
};

const getPoolRewardsPercentage = async (poolIndex, fryerAddr) => {
  const fryerContract = new web3.eth.Contract(DeepFryer, fryerAddr);

  let totalRewardPoints = new BigNumber(await fryerContract.methods.totalAllocPoint().call());

  let poolInfo = await fryerContract.methods.poolInfo(poolIndex).call();
  let poolRewardPoints = new BigNumber(poolInfo.allocPoint);

  const poolRewardsPercentage = poolRewardPoints.dividedBy(totalRewardPoints);
  return poolRewardsPercentage;
};

module.exports = getFryApys;
