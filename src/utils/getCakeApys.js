const axios = require('axios');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const { compound } = require('./compound');
const MasterChef = require('../abis/MasterChef.json');
const ERC20 = require('../abis/ERC20.json');

const CAKE = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const SYRUP = '0x009cF7bC57584b7998236eff51b98A168DceA9B0';
const MASTER_CHEF = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';

const pools = [
  {
    name: 'sxp',
    smartChef: '0xd32b30b151a6adb2e0fa573a37510c097dabd2f3',
    coingeckoId: 'swipe',
    asset: '0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A',
  },
  {
    name: 'twt',
    smartChef: '0xAfd61Dc94f11A70Ae110dC0E0F2061Af5633061A',
    coingeckoId: 'trust-wallet-token',
    asset: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
  },
  {
    name: 'inj',
    smartChef: '0x92E8CeB7eAeD69fB6E4d9dA43F605D2610214E68',
    coingeckoId: 'injective-protocol',
    asset: '0xa2B726B1145A4773F68593CF171187d8EBe4d495',
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
  console.log(response.data[id].usd);
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
