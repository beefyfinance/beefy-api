const axios = require('axios');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const { compound } = require('../src/utils/compound');
const fryerAbi = require('./fryer.json');
const erc20Abi = require('./erc20.json');

const BURGER = '0xae9269f27437f0fcbc232d39ec814844a51d6b8f';
const FRYER = '0x066d5544a0b05b19f08e45dbc13758a3590386c4';

const web3 = new Web3('https://bsc-dataseed1.defibit.io/');

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
  const secondsPerBlock = 5;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear).dividedBy('1e18');

  const friesPrice = await getPrice('fryworld');
  const yearlyRewardsInUsd = yearlyRewards.times(friesPrice);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (poolAddr, coingeckoId, tokenAddr) => {
  const tokenPrice = await getPrice(coingeckoId);
  const tokenContract = await new web3.eth.Contract(erc20Abi, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(poolAddr).call());
  const totalStakedInUsd = totalStaked.dividedBy('1e18').times(tokenPrice);
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

const getApy = async () => {
  const yearlyRewardsInUsd = await getYearlyRewardsInUsd(FRYER, 500);
  const poolRewardsPercentage = await getPoolRewardsPercentage(0, FRYER);
  const yearlyPoolRewardsInUsd = yearlyRewardsInUsd.times(poolRewardsPercentage);
  const totalStakedInUsd = await getTotalStakedInUsd(FRYER, 'burger-swap', BURGER);

  const apy = yearlyPoolRewardsInUsd.dividedBy(totalStakedInUsd);

  console.log('Yearly Rewards in USD:', yearlyRewardsInUsd.toString());
  console.log('Pool Reward Percentage:', poolRewardsPercentage.toString());
  console.log('Total Staked in USD:', totalStakedInUsd.toString());
  console.log('APY', apy.toString());
};

getApy();
