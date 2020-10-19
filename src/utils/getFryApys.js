const axios = require('axios');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const { compound } = require('./compound');
const fryerAbi = require('../abis/fryer.json');
const erc20Abi = require('../abis/erc20.json');

const FRYER = '0x066d5544a0b05b19f08e45dbc13758a3590386c4';
const pools = [
  {
    name: 'burger',
    poolIndex: 0,
    coingeckoId: 'burger-swap',
    asset: '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f',
  },
  {
    name: 'busd',
    poolIndex: 1,
    coingeckoId: 'binance-usd',
    asset: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  },
  {
    name: 'wbnb',
    poolIndex: 2,
    coingeckoId: 'binancecoin',
    asset: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
];

const web3 = new Web3('https://bsc-dataseed1.defibit.io/');

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

const getPrice = async id => {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids: id,
      vs_currencies: 'usd',
    },
  });
  return response.data[id].usd;
};

const getYearlyRewardsInUsd = async (fyreAddr, blocks) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + blocks;
  const fryerContract = new web3.eth.Contract(fryerAbi, fyreAddr);

  const periodRewards = new BigNumber(await fryerContract.methods.getTotalRewardInfo(fromBlock, toBlock).call());
  const blockRewards = periodRewards.dividedBy(blocks);
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const friesPrice = await getPrice('fryworld');
  const yearlyRewardsInUsd = yearlyRewards.times(friesPrice).dividedBy('1e18');
  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (poolAddr, coingeckoId, tokenAddr) => {
  const tokenPrice = await getPrice(coingeckoId);
  const tokenContract = await new web3.eth.Contract(erc20Abi, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(poolAddr).call());
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

const getPoolRewardsPercentage = async (poolIndex, fryerAddr) => {
  const fryerContract = new web3.eth.Contract(fryerAbi, fryerAddr);
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

getFryApys();

module.exports = getFryApys;
