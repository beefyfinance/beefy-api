const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const DeepFryer = require('../../../abis/DeepFryer.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getCoingeckoPrice } = require('../../../utils/getPrice');

const FRYER = '0x066d5544a0b05b19f08e45dbc13758a3590386c4';
const pools = [
  {
    name: 'burger',
    poolIndex: 0,
    coingeckoId: 'burger-swap',
    asset: '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f',
  },
];

const web3 = new Web3(process.env.BSC_RPC);

const getFryApys = async () => {
  const apys = {};

  for (const pool of pools) {
    const yearlyRewardsInUsd = await getYearlyRewardsInUsd(FRYER, 1);
    const poolRewardsPercentage = await getPoolRewardsPercentage(pool.poolIndex, FRYER);
    const yearlyPoolRewardsInUsd = yearlyRewardsInUsd.times(poolRewardsPercentage);

    const totalStakedInUsd = await getTotalStakedInUsd(FRYER, pool.coingeckoId, pool.asset);

    const apy = yearlyPoolRewardsInUsd.dividedBy(totalStakedInUsd);
    apys[pool.name] = apy;
  }

  return apys;
};

const getYearlyRewardsInUsd = async (fryerAddr, blocks) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + blocks;
  const fryerContract = new web3.eth.Contract(DeepFryer, fryerAddr);

  const periodRewards = new BigNumber(await fryerContract.methods.getTotalRewardInfo(fromBlock, toBlock).call());
  const blockRewards = periodRewards.dividedBy(blocks);
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const friesPrice = await getCoingeckoPrice('fryworld');
  const yearlyRewardsInUsd = yearlyRewards.times(friesPrice).dividedBy('1e18');
  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (poolAddr, coingeckoId, tokenAddr) => {
  const tokenPrice = await getCoingeckoPrice(coingeckoId);
  const tokenContract = await new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(poolAddr).call());
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

const getPoolRewardsPercentage = async (poolIndex, fryerAddr) => {
  const fryerContract = new web3.eth.Contract(DeepFryer, fryerAddr);
  const poolLength = await fryerContract.methods.poolLength().call();

  let totalRewardPoints = new BigNumber('0');
  let poolRewardPoints;

  for (let i = 0; i < poolLength; i++) {
    const poolInfo = await fryerContract.methods.poolInfo(i).call();
    totalRewardPoints = totalRewardPoints.plus(poolInfo.allocPoint);

    if (i == poolIndex) poolRewardPoints = new BigNumber(poolInfo.allocPoint);
  }

  const poolRewardsPercentage = poolRewardPoints.dividedBy(totalRewardPoints);
  return poolRewardsPercentage;
};

module.exports = getFryApys;
